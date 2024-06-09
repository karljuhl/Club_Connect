import { getCurrentUser } from "@/lib/session"
import { notFound, redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { Chatbot, User } from "@prisma/client"
import { db } from "@/lib/db"
import Link from "next/link"
import { DashboardHeader } from "@/components/header"
import { DashboardShell } from "@/components/shell"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"
import { CodeBlock } from "@/components/ui/codeblock"
import { siteConfig } from "@/config/site"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AccordionTrigger, AccordionContent, AccordionItem, Accordion } from "@/components/ui/accordion"

interface ChatbotSettingsProps {
    params: { chatbotId: string }
}

async function getChatbotForUser(chatbotId: Chatbot["id"], userId: User["id"]) {
    return await db.chatbot.findFirst({
        where: {
            id: chatbotId,
            userId: userId,
        },
    })
}

export default async function EmbedOnSitePage({ params }: ChatbotSettingsProps) {

    const user = await getCurrentUser()

    if (!user) {
        redirect(authOptions?.pages?.signIn || "/login")
    }

    const chatbot = await getChatbotForUser(params.chatbotId, user.id)

    if (!chatbot) {
        notFound()
    }

    return (
        <DashboardShell>
            <DashboardHeader heading="Embed On Website" text="Make your assistant publicly accessible for users.">
            <Link
                    href={`/dashboard/chatbots`}
                    className={cn(
                        buttonVariants({ variant: "ghost" }),
                        "md:left-8 md:top-8"
                    )}
                >
                    <>
                        <Icons.chevronLeft className="mr-2 h-4 w-4" />
                        Back
                    </>
                </Link>
            </DashboardHeader>
            <div className="flex flex-col">
            <Accordion className="w-full mb-4" type="multiple">
                <AccordionItem value="item-0">
                    <AccordionTrigger className="hover:underline-none text-muted-foreground">
                        Not Sure How to Embed Your Assistant?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                        <p>There are two ways you can embed your assistant into your website, using the window (iframe) or the widget (chat bubble in the bottom right):</p>
                        <ul className="list-disc pl-4">
                            <li>
                                <Accordion className="w-full my-2">
                                    <AccordionItem value="wordpress">
                                        <AccordionTrigger className="hover:underline-none text-muted-foreground">
                                            WordPress
                                        </AccordionTrigger>
                                        <AccordionContent className="text-muted-foreground">
                                            <ul>
                                                <li>Go to &apos;plugins&apos; sections and add new plugin &apos;WPCode&apos;</li>
                                                <br></br>
                                                <li>Activate the plugin and navigate to &apos;Code Snippets&apos; in the left sidebar, and click &apos;header & Footer&apos;</li>
                                                <br></br>
                                                <li>Copy the widget code from ClubConnect, paste into the footer section and save</li>
                                                <br></br>
                                                <li>Refresh your website and see your Assistant in action</li>
                                            </ul>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            </li>
                            <li>
                                <Accordion className="w-full my-2">
                                    <AccordionItem value="shopify">
                                        <AccordionTrigger className="hover:underline-none text-muted-foreground">
                                            Shopify
                                        </AccordionTrigger>
                                        <AccordionContent className="text-muted-foreground">
                                            <ul>
                                                <li>Copy the widget code from ClubConnect</li>
                                                <br></br>
                                                <li>Go to your Shopify themes code and paste the code inside the body tag</li>
                                                <br></br>
                                                <li>Refresh your website and see your Assistant in action</li>
                                            </ul>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            </li>
                            <li>
                                <Accordion className="w-full my-2">
                                    <AccordionItem value="squarespace">
                                        <AccordionTrigger className="hover:underline-none text-muted-foreground">
                                            Squarespace
                                        </AccordionTrigger>
                                        <AccordionContent className="text-muted-foreground">
                                            <ul>
                                                <li>Copy the widget code from ClubConnect</li>
                                                <br></br>
                                                <li>Navigate to &apos;Settings&apos; in the left sidebar, open &apos;Advanced Settings&apos;</li>
                                                <br></br>
                                                <li>Click on &apos;Code Injection&apos; and paste in the footer section the code you got from ClubConnect</li>
                                                <br></br>
                                                <li>Refresh your website and see your Assistant in action</li>
                                            </ul>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            </li>
                            <li>
                                <Accordion className="w-full my-2">
                                    <AccordionItem value="other">
                                        <AccordionTrigger className="hover:underline-none text-muted-foreground">
                                            Other hosting services
                                        </AccordionTrigger>
                                        <AccordionContent className="text-muted-foreground">
                                                 <ul>
                                                    <li>Copy the widget code from ClubConnect</li>
                                                    <br></br>
                                                    <li>Login to your web hosting provider and navigate to your &apos;File Manager&apos;</li>
                                                    <br></br>
                                                    <li>Navigate past &apos;public_html&apos; if needed and find &apos;index.html&apos;</li>
                                                    <br></br>
                                                    <li>Paste the code into the footer section just before the &apos;/footer&apos; tag</li>
                                                    <br></br>
                                                    <li>Refresh your website and see your Assistant in action</li>
                                                </ul>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            </li>
                        </ul>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
                </div>
            <Tabs className="w-full overflow-x-auto max-w-full" defaultValue="widget">
                <TabsList className="mb-10 grid w-full grid-cols-5 gap-4">
                    <TabsTrigger value="widget">Widget</TabsTrigger>
                    <TabsTrigger value="window">Window</TabsTrigger>
                </TabsList>
                <TabsContent value="window">
                    <div className="space-y-4">
                        <CodeBlock
                            language="html"
                            value={`<iframe 
    src="${siteConfig.url}embed/${params.chatbotId}/window?chatbox=false"
    style="overflow: hidden; height: 80vh; border: 0 none; width: 480px; bottom: -30px;"
    allowfullscreen allow="clipboard-read; clipboard-write" 
>
</iframe>
`}>
                        </CodeBlock>
                    </div>
                </TabsContent>
                <TabsContent value="widget">
                    <div className="space-y-4">
                        <CodeBlock
                            language="html"
                            value={`<script>
        window.addEventListener("message",function(t){var e=document.getElementById("openassistantgpt-chatbot-iframe"),s=document.getElementById("openassistantgpt-chatbot-button-iframe");"openChat"===t.data&&(console.log("Toggle chat visibility"),e&&s?(e.contentWindow.postMessage("openChat","*"),s.contentWindow.postMessage("openChat","*"),e.style.pointerEvents="auto",e.style.display="block",window.innerWidth<640?(e.style.position="fixed",e.style.width="100%",e.style.height="100%",e.style.top="0",e.style.left="0",e.style.zIndex="9999"):(e.style.position="fixed",e.style.width="30rem",e.style.height="65vh",e.style.bottom="0",e.style.right="0",e.style.top="",e.style.left="")):console.error("iframe not found")),"closeChat"===t.data&&e&&s&&(e.style.display="none",e.style.pointerEvents="none",e.contentWindow.postMessage("closeChat","*"),s.contentWindow.postMessage("closeChat","*"))});
</script>

<body>
  <iframe src="${siteConfig.url}embed/${params.chatbotId}/button?chatbox=false"
    style="margin-right: 1rem; margin-bottom: 1rem; position: fixed; right: 0; bottom: 0; width: 56px; height: 56px; border: 0; border-color: rgb(0, 0, 0); border-radius: 50%; color-scheme: none; background: none;"
    id="openassistantgpt-chatbot-button-iframe"></iframe>
  <iframe src="${siteConfig.url}embed/${params.chatbotId}/window?chatbox=false&withExitX=true"
    style="margin-right: 1rem; margin-bottom: 6rem; display: none; position: fixed; right: 0; bottom: 0; pointer-events: none; overflow: hidden; height: 65vh; border: 2px solid #e2e8f0; border-radius: 0.375rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); width: 30rem;"
    allowfullscreen id="openassistantgpt-chatbot-iframe"></iframe>
</body>
`}>
                        </CodeBlock>
                        <CodeBlock
                            language="javascript"
                            value={`
export default function Chatbot() {

    const customStyle = {
        marginRight: '1rem',
        marginBottom: '6rem',
        display: 'none',
        position: 'fixed',
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        height: '65vh',
        border: '2px solid #e2e8f0',
        borderRadius: '0.375rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        width: '30rem'
    };

    return (
        <div>
            <script dangerouslySetInnerHTML={{
                __html: \`
        window.addEventListener("message",function(t){var e=document.getElementById("openassistantgpt-chatbot-iframe"),s=document.getElementById("openassistantgpt-chatbot-button-iframe");"openChat"===t.data&&(console.log("Toggle chat visibility"),e&&s?(e.contentWindow.postMessage("openChat","*"),s.contentWindow.postMessage("openChat","*"),e.style.pointerEvents="auto",e.style.display="block",window.innerWidth<640?(e.style.position="fixed",e.style.width="100%",e.style.height="100%",e.style.top="0",e.style.left="0",e.style.zIndex="9999"):(e.style.position="fixed",e.style.width="30rem",e.style.height="65vh",e.style.bottom="0",e.style.right="0",e.style.top="",e.style.left="")):console.error("iframe not found")),"closeChat"===t.data&&e&&s&&(e.style.display="none",e.style.pointerEvents="none",e.contentWindow.postMessage("closeChat","*"),s.contentWindow.postMessage("closeChat","*"))});
      \`}} />
            <iframe
                src="${siteConfig.url}embed/${params.chatbotId}/button?chatbox=false"
                scrolling='no'
                id="openassistantgpt-chatbot-button-iframe"
                className="fixed bottom-0 right-0 mb-4 z-50 flex items-end inline-block mr-4 w-14 h-14 border border-gray-300 rounded-full shadow-md"
            ></iframe>
            <iframe
                src="${siteConfig.url}embed/${params.chatbotId}/window?chatbox=false&withExitX=true"
                style={customStyle}
                id="openassistantgpt-chatbot-iframe"
            ></iframe>
        </div>
    )
}
`}>
                        </CodeBlock>
                    </div>
                </TabsContent>
            </Tabs>
        </DashboardShell >
    )
}