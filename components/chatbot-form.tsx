"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { Chatbot, File, ChatbotModel, User } from "@prisma/client"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { cn } from "@/lib/utils"
import { chatbotSchema } from "@/lib/validations/chatbot"
import { buttonVariants } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { Icons } from "@/components/icons"
import { Form, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import Select from 'react-select';
import { Textarea } from "@/components/ui/textarea"

interface ChatbotFormProps extends React.HTMLAttributes<HTMLFormElement> {
    chatbot: Pick<Chatbot, "id" | "name" | "openaiKey" | "modelId" | "createdAt" | "welcomeMessage" | "prompt" | "chatbotErrorMessage" | "isImported">
    currentFiles: File["id"][]
    models: ChatbotModel[]
    files: File[]
    user: Pick<User, "id">
}

type FormData = z.infer<typeof chatbotSchema>

export function ChatbotForm({ chatbot, currentFiles, models, files, className, ...props }: ChatbotFormProps) {
    const router = useRouter()
    const form = useForm<FormData>({
        resolver: zodResolver(chatbotSchema),
        defaultValues: {
            name: chatbot.name,
            openAIKey: chatbot.openaiKey,
            welcomeMessage: chatbot.welcomeMessage,
            chatbotErrorMessage: chatbot.chatbotErrorMessage,
            prompt: chatbot.prompt,
            modelId: chatbot.modelId!,
            files: currentFiles,
        }
    })
    const [isSaving, setIsSaving] = useState<boolean>(false)
    const [availablesModels, setAvailablesModels] = useState<string[]>([])

    useEffect(() => {
        const init = async () => {
            const supportedModels = await getAvailableModels()
            setAvailablesModels(supportedModels)
        }
        init()
    }, [])

    async function getAvailableModels() {
        const response = await fetch(`/api/users/${props.user.id}/openai/models`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
        const models = await response.json()
        return models
    }

    async function onSubmit(data: FormData) {
        console.log(data)
        setIsSaving(true)

        const response = await fetch(`/api/chatbots/${chatbot.id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: data.name,
                openAIKey: data.openAIKey,
                modelId: data.modelId,
                welcomeMessage: data.welcomeMessage,
                chatbotErrorMessage: data.chatbotErrorMessage,
                prompt: data.prompt,
                files: data.files,
            }),
        })

        setIsSaving(false)

        if (!response?.ok) {

            if (response.status === 400) {
                return toast({
                    title: "Something went wrong.",
                    description: await response.text(),
                    variant: "destructive",
                })
            }

            return toast({
                title: "Something went wrong.",
                description: "Your chatbot was not updated. Please try again.",
                variant: "destructive",
            })
        }

        toast({
            description: "Your chatbot has been updated.",
        })

        router.refresh()
    }

    return (
        <Form {...form}>
            <form
                className={cn(className)}
                onSubmit={form.handleSubmit(onSubmit)}
                {...props}
            >
                <Card>
                    <CardHeader>
                        <CardTitle>Chatbot settings</CardTitle>
                        <CardDescription>
                            Update your chatbot configuration.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel htmlFor="name">
                                        Display Name
                                    </FormLabel>

                                    <Input
                                        defaultValue={chatbot.name}
                                        onChange={field.onChange}
                                        id="name"
                                    />
                                    <FormDescription>
                                        The name that will be displayed in the dashboard
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="welcomeMessage"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel htmlFor="welcomeMessage">
                                        Welcome Message
                                    </FormLabel >
                                    <Input
                                        defaultValue={chatbot.welcomeMessage}
                                        onChange={field.onChange}
                                        id="welcomeMessage"
                                    />
                                    <FormDescription>
                                        The first message that will be sent to the user when they start a conversation with your chatbot.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="prompt"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel htmlFor="prompt">
                                        Prompt
                                    </FormLabel>
                                    <Textarea
                                        defaultValue={chatbot.prompt}
                                        onChange={field.onChange}
                                        id="prompt"
                                    />
                                    <FormDescription>
                                        This is the prompt that will be sent to OpenAI, here&apos;s and example:
                                        &quot;You are an assistant you help users that visit our website, keep it short, always refer to the documentation provided and never ask for more information.&quot;
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="files"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel htmlFor="files">
                                        Choose your file for retrival
                                    </FormLabel>
                                    <Select
                                        isMulti
                                        closeMenuOnSelect={false}
                                        onChange={value => field.onChange(value.map((v) => v.value))}
                                        defaultValue={files.filter((file) => currentFiles.includes(file.id)).map((file) => ({ value: file.id, label: file.name }))}
                                        name="files"
                                        id="files"
                                        options={files.map((file) => ({ value: file.id, label: file.name }))}
                                        className="basic-multi-select"
                                        classNamePrefix="select"
                                    />

                                    <FormDescription>
                                        The OpenAI model will use this file to search for specific content.
                                        If you don&apos;t have a file yet, it is because you haven&apos;t published any file.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="chatbotErrorMessage"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel htmlFor="chatbotErrorMessage">
                                        Chatbot Error Message
                                    </FormLabel>
                                    <Textarea
                                        defaultValue={chatbot.chatbotErrorMessage}
                                        onChange={field.onChange}
                                        id="chatbotErrorMessage"
                                    />
                                    <FormDescription>
                                        The message that will be displayed when the chatbot encounters an error and can&apos;t reply to a user.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                    <CardFooter>
                        <button
                            type="submit"
                            className={cn(buttonVariants(), className)}
                            disabled={isSaving}
                        >
                            {isSaving && (
                                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            <span>Save</span>
                        </button>
                    </CardFooter>
                </Card>
            </form>
        </Form>
    )
}