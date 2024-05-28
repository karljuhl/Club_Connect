'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Form, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { Icons } from "@/components/icons"
import { chatbotSchema } from "@/lib/validations/chatbot"
import { ChatbotModel, File, User } from "@prisma/client"
import Select from 'react-select';
import { Textarea } from "@/components/ui/textarea"

type FormData = z.infer<typeof chatbotSchema>

interface NewChatbotProps extends React.HTMLAttributes<HTMLElement> {
    isOnboarding: boolean
    user: Pick<User, "id">
}

export function NewChatbotForm({ isOnboarding, className, ...props }: NewChatbotProps) {
    const router = useRouter()
    const form = useForm<FormData>({
        resolver: zodResolver(chatbotSchema),
        defaultValues: {
            welcomeMessage: "Hello, how can I help you?",
            prompt: "You are an assistant you help users that visit our website, keep it short, always refer to the documentation provided and never ask for more information.",
            chatbotErrorMessage: "Oops! An error has occurred. If the issue persists, feel free to reach out to our support team for assistance. We're here to help!"
        }
    })

    const [models, setModels] = useState<ChatbotModel[]>([])
    const [files, setFiles] = useState<File[]>([])
    const [isSaving, setIsSaving] = useState<boolean>(false)

    const { formState: { errors } } = form;
console.log("Validation Errors:", errors);
console.log("Complete Form State:", form.watch());


    useEffect(() => {
        const init = async () => {

            const filesResponse = await getFiles()
            setFiles(filesResponse)
        }
        init()
    }, [])

    async function getFiles() {
        const response = await fetch('/api/files', {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })

        const files = await response.json()
        return files
    }
    

    async function onSubmit(data) {
        console.log("Form Submitted with Data:", data);
        setIsSaving(true);
    
        try {
            const response = await fetch(`/api/chatbots`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    name: data.name,
                    prompt: data.prompt,
                    welcomeMessage: data.welcomeMessage,
                    chatbotErrorMessage: data.chatbotErrorMessage,
                    files: data.files
                }),
            });
    
            if (!response.ok) {
                const errorText = await response.text();
                console.log("API Response Error:", errorText);
                toast({
                    title: "Something went wrong.",
                    description: errorText,
                    variant: "destructive",
                });
            } else {
                const result = await response.json();
                console.log("API Response Success:", result);
                toast({
                    description: "Your chatbot has been saved.",
                });
                router.refresh();
                if (!isOnboarding) {
                    router.push(`/dashboard/chatbots/${result.chatbot.id}/chat`);
                }
            }
        } catch (error) {
            console.error("Submission Error:", error);
            toast({
                title: "Network error",
                description: "Failed to submit data. Please try again later.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    }
    

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <Card>
                    <CardHeader>
                        <CardTitle>Create new Chatbot</CardTitle>
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
                                    <FormLabel htmlFor="welcomemessage">
                                        Welcome message
                                    </FormLabel>
                                    <Input
                                        onChange={field.onChange}
                                        value={field.value}
                                        id="welcomemessage"
                                    />
                                    <FormDescription>
                                        The welcome message that will be sent to the user when they start a conversation
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>)}
                        />
                        <FormField
                            control={form.control}
                            name="prompt"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel htmlFor="prompt">
                                        Default prompt
                                    </FormLabel >
                                    <Textarea
                                        onChange={field.onChange}
                                        value={field.value}
                                        id="prompt"
                                    />
                                    <FormDescription>
                                        The prompt that will be sent to OpenAI for every messages, here&apos;s and example:
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
                                        defaultValue={field.value}
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
                                        value={field.value}
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
                    <button type="submit" className={cn(buttonVariants(), className)} disabled={isSaving}>
                {isSaving ? <Icons.spinner className="mr-2 h-4 w-4 animate-spin" /> : "Create"}
            </button>
                    </CardFooter>
                </Card>
            </form >
        </Form >
    )
}