'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/router";  // Corrected from 'next/navigation' to 'next/router'
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Form, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast"; // Ensure toast is correctly imported
import { Icons } from "@/components/icons"; // Ensure Icons is correctly imported
import { chatbotSchema } from "@/lib/validations/chatbot";
import { ChatbotModel, File, User } from "@prisma/client";
import Select from 'react-select';
import { Textarea } from "@/components/ui/textarea";


interface NewChatbotProps {
    isOnboarding: boolean;
    user: Pick<User, "id">;
    className?: string;
}

export function NewChatbotForm({ isOnboarding, user, className }: NewChatbotProps) {
    const router = useRouter();
    const { control, handleSubmit, formState: { errors }, watch } = useForm<FormData>({
        resolver: zodResolver(chatbotSchema),
        defaultValues: {
            welcomeMessage: "Hello, how can I help you?",
            prompt: "You are an assistant. You help users that visit our website, keep it short, always refer to the documentation provided and never ask for more information.",
            chatbotErrorMessage: "Oops! An error has occurred. If the issue persists, feel free to reach out to our support team for assistance. We're here to help!"
        }
    });

    const [models, setModels] = useState<ChatbotModel[]>([]);
    const [files, setFiles] = useState<File[]>([]);
    const [isSaving, setIsSaving] = useState<boolean>(false);

    console.log("Validation Errors:", errors);
    console.log("Complete Form State:", watch());

    useEffect(() => {
        async function init() {
            const response = await fetch('/api/files', {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            const files = await response.json();
            console.log("Files loaded:", files);
            setFiles(files);
        }
        init();
    }, []);

    async function onSubmit(data: FormData, event: React.BaseSyntheticEvent) {
        event.preventDefault();
        console.log("Form Submitted with Data:", data);
        setIsSaving(true);

        const response = await fetch(`/api/chatbots`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const result = await response.text();
        setIsSaving(false);

        if (!response.ok) {
            console.log("API Response Error:", result);
            toast({ title: "Error", description: result, variant: "destructive" });
            return;
        }

        console.log("API Response Success:", result);
        toast({ description: "Your chatbot has been saved." });
        router.refresh();

        if (!isOnboarding) {
            const object = JSON.parse(result);
            router.push(`/dashboard/chatbots/${object.chatbot.id}/chat`);
        }
    }

    return (
        <Form onSubmit={handleSubmit(onSubmit)}>
            <Card>
                <CardHeader>
                    <CardTitle>Create new Chatbot</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <FormField name="name" control={control} render={({ field }) => (
                        <FormItem>
                            <FormLabel htmlFor="name">Display Name</FormLabel>
                            <Input {...field} id="name" />
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField name="welcomeMessage" control={control} render={({ field }) => (
                        <FormItem>
                            <FormLabel htmlFor="welcomemessage">Welcome Message</FormLabel>
                            <Input {...field} id="welcomemessage" />
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField name="prompt" control={control} render={({ field }) => (
                        <FormItem>
                            <FormLabel htmlFor="prompt">Default Prompt</FormLabel>
                            <Textarea {...field} id="prompt" />
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField name="files" control={control} render={({ field }) => (
                        <FormItem>
                            <FormLabel htmlFor="files">Choose Your File for Retrieval</FormLabel>
                            <Select
                                isMulti
                                closeMenuOnSelect={false}
                                onChange={value => field.onChange(value.map((v) => v.value))}
                                options={files.map(file => ({ value: file.id, label: file.name }))}
                                className="basic-multi-select"
                                classNamePrefix="select"
                            />
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField name="chatbotErrorMessage" control={control} render={({ field }) => (
                        <FormItem>
                            <FormLabel htmlFor="chatbotErrorMessage">Chatbot Error Message</FormLabel>
                            <Textarea {...field} id="chatbotErrorMessage" />
                            <FormMessage />
                        </FormItem>
                    )} />
                </CardContent>
                <CardFooter>
                    <button type="submit" className={cn(buttonVariants(), className)} disabled={isSaving}>
                        {isSaving && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                        Create
                    </button>
                </CardFooter>
            </Card>
        </Form>
    );
}
