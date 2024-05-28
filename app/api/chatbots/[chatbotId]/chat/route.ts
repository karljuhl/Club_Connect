import { db } from "@/lib/db"
import OpenAI from "openai"

import { z } from "zod"
import { getUserSubscriptionPlan } from "@/lib/subscription";
import { AssistantResponse } from 'ai';

export const maxDuration = 300;

const routeContextSchema = z.object({
    params: z.object({
        chatbotId: z.string(),
    }),
})

export async function OPTIONS(req: Request) {
    return new Response('Ok', { status: 200 })
}

export async function POST(
    req: Request,
    context: z.infer<typeof routeContextSchema>
) {
    try {
        const { params } = routeContextSchema.parse(context)

        const chatbot = await db.chatbot.findUnique({
            select: {
                id: true,
                openaiKey: true,
                userId: true,
                openaiId: true,
                chatbotErrorMessage: true,
            },
            where: {
                id: params.chatbotId,
            },
        })

        if (!chatbot) {
            return new Response(null, { status: 404 })
        }

        const openai = new OpenAI({
            apiKey: chatbot.openaiKey || process.env.DEFAULT_CHATBOT_API_KEY
        })

        const input: {
            threadId: string | null;
            message: string;
            clientSidePrompt: string;
        } = await req.json();

        // Create a thread if needed
        const threadId = input.threadId ?? (await openai.beta.threads.create({})).id;

        // Add a message to the thread
        const createdMessage = await openai.beta.threads.messages.create(threadId, {
            role: 'user',
            content: input.message,
        });

        return AssistantResponse(
            { threadId, messageId: createdMessage.id },
            async ({ sendMessage, forwardStream, sendDataMessage }) => {

                try {
                    const plan = await getUserSubscriptionPlan(chatbot.userId)
                    if (plan.unlimitedMessages === false) {
                        const messageCount = await db.message.count({
                            where: {
                                userId: chatbot.userId,
                                createdAt: {
                                    gte: new Date(new Date().setDate(new Date().getDate() - 30))
                                }
                            }
                        })
                        console.log(`Message count: ${messageCount}`)
                        if (messageCount >= plan.maxMessagesPerMonth!) {
                            console.log(`Reached message limit ${chatbot.userId}`)
                            sendMessage({
                                id: "end",
                                role: 'assistant',
                                content: [{ type: 'text', text: { value: "You have reached your monthly message limit. Upgrade your plan to continue using your chatbot." } }]
                            });
                            return;
                        }
                    }

                    // Run the assistant on the thread
                    const runStream = openai.beta.threads.runs.stream(threadId, {
                        assistant_id: chatbot.openaiId,
                        instructions: input.clientSidePrompt.replace('+', '') || "",
                    });

                    let runResult = await forwardStream(runStream);

                    // validate if there is any error
                    if (runResult == undefined) {
                        console.log(`Error running assistant ${chatbot.openaiId} on thread ${threadId}`)

                        // set the error if last_error is not null
                        let errorMessage = 'Unknown error'
                        if (runStream.currentEvent()?.data.last_error) {
                            errorMessage = runStream.currentEvent()?.data.last_error.message
                        }

                        await db.chatbotErrors.create({
                            data: {
                                errorMessage: errorMessage,
                                threadId: threadId || '',
                                chatbotId: chatbot.id,
                            }
                        })

                        sendMessage({
                            id: "end",
                            role: 'assistant',
                            content: [{
                                type: 'text', text: { value: chatbot.chatbotErrorMessage }
                            }]
                        });
                        return;
                    }

                    // Get new thread messages (after our message)
                    const responseMessages = (
                        await openai.beta.threads.messages.list(threadId, {
                            after: createdMessage.id,
                            order: 'asc',
                        })
                    ).data;

                    for (const message of responseMessages) {
                        await db.message.create({
                            data: {
                                chatbotId: params.chatbotId,
                                userId: chatbot.userId,
                                message: input.message,
                                threadId: threadId,
                                response: message.content[0].text.value,
                                from: req.headers.get("origin") || "unknown",
                            }
                        })

                    }
                } catch (error) {
                    console.error(error)
                    sendMessage({
                        id: "end",
                        role: 'assistant',
                        content: [{ type: 'text', text: { value: chatbot.chatbotErrorMessage } }]
                    });
                }
            },
        );

    } catch (error) {
        console.error(error)
        if (error instanceof z.ZodError) {
            return new Response(JSON.stringify(error.issues), { status: 422 })
        }

        if (error instanceof OpenAI.APIError) {
            return new Response(error.message, { status: 401 })
        }

        return new Response(null, { status: 500 })
    }
}
