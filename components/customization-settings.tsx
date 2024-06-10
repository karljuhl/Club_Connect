"use client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { buttonVariants } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import { Chatbot } from "@prisma/client"
import { customizationSchema } from "@/lib/validations/customization"
import React, { useRef, useState, useEffect } from 'react';
import { Icons } from "@/components/icons"
import { Input } from "@/components/ui/input"
import { GradientPicker } from "@/components/gradient-picker"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Checkbox } from "@/components/ui/checkbox"

interface ChatbotOperationsProps {
    chatbot: Pick<Chatbot, "id" | "name" | "modelId">
}

export function CustomizationSettings({ chatbot }: ChatbotOperationsProps) {
    const inputFileRef = useRef<HTMLInputElement>(null);

    const [bubbleColor, setBubbleColor] = useState('')
    const [bubbleLogoColor, setBubbleLogoColor] = useState('')
    const [chatHeaderBackgroundColor, setChatHeaderBackgroundColor] = useState('')
    const [chatHeaderTextColor, setChatHeaderTextColor] = useState('')
    const [userBubbleColor, setUserBubbleColor] = useState('')
    const [userBubbleMessageColor, setUserBubbleMessageColor] = useState('')
    const [chatbotLogoURL, setChatbotLogoURL] = useState('')
    const [useDefaultImage, setUseDefaultImage] = useState<boolean>(true)
    const [assistantImageBackgroundColor, setAssistantImageBackgroundColor] = useState('')
    const [imagePreviewUrl, setImagePreviewUrl] = useState('');

    const [isSaving, setIsSaving] = useState<boolean>(false)

    const form = useForm<z.infer<typeof customizationSchema>>({
        resolver: zodResolver(customizationSchema),
        defaultValues: {
            displayBranding: true,
            chatTitle: "",
            chatMessagePlaceHolder: "",
            bubbleColor: "",
            bubbleTextColor: "",
            chatHeaderBackgroundColor: "",
            chatHeaderTextColor: "",
            userReplyBackgroundColor: "",
            userReplyTextColor: "",
            assistantImageBackgroundColor: "",
        },
    })

    useEffect(() => {
        fetch(`/api/chatbots/${chatbot.id}/config`, {
            method: "GET",
        }).then((res) => res.json()).then((data) => {
            form.setValue("displayBranding", data.displayBranding)
            form.setValue("chatTitle", data.chatTitle)
            form.setValue("chatMessagePlaceHolder", data.chatMessagePlaceHolder)
            // get the colors from the chatbot
            setBubbleColor(data.bubbleColor)
            setBubbleLogoColor(data.bubbleTextColor)
            setChatHeaderBackgroundColor(data.chatHeaderBackgroundColor)
            setChatHeaderTextColor(data.chatHeaderTextColor)
            setUserBubbleColor(data.userReplyBackgroundColor)
            setUserBubbleMessageColor(data.userReplyTextColor)
            setChatbotLogoURL(data.chatbotLogoURL)
            setassistantImageBackgroundColor(data.assistantImageBackgroundColor || "#777777")

            if (data.chatbotLogoURL) {
                setUseDefaultImage(false)
            }
        })
    }, [])

    useEffect(() => {
        if (inputFileRef.current?.files && inputFileRef.current.files.length > 0) {
            console.log(inputFileRef.current.files[0])
            setUseDefaultImage(false)
        }
    }, [inputFileRef.current?.files])

    const handleFileChange = (e) => {
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            const imageUrl = URL.createObjectURL(file);
            setImagePreviewUrl(imageUrl);
            setUseDefaultImage(false);  // Update to use the selected image
        }
    };

    async function onSubmit(data: z.infer<typeof customizationSchema>) {
        setIsSaving(true)

        if (!inputFileRef.current?.files) {
            throw new Error('No file selected');
        }

        const fileImage = inputFileRef.current.files[0];
        console.log(fileImage)

        const formData = new FormData();
        formData.append('displayBranding', String(data.displayBranding));
        formData.append('chatTitle', data.chatTitle || '');
        formData.append('chatMessagePlaceHolder', data.chatMessagePlaceHolder || '');
        formData.append('bubbleColor', bubbleColor);
        formData.append('bubbleTextColor', bubbleLogoColor);
        formData.append('chatHeaderBackgroundColor', chatHeaderBackgroundColor);
        formData.append('chatHeaderTextColor', chatHeaderTextColor);
        formData.append('userReplyBackgroundColor', userBubbleColor);
        formData.append('userReplyTextColor', userBubbleMessageColor);
        formData.append('assistantImageBackgroundColor', assistantImageBackgroundColor);

        if (useDefaultImage) {
            formData.set('chatbotLogoFilename', '');
            formData.set('chatbotLogo', '');
        } else {
            formData.append('chatbotLogoFilename', fileImage.name);
            formData.append('chatbotLogo', fileImage);
        }

        formData.append('useDefaultImage', String(useDefaultImage));

        const response = await fetch(`/api/chatbots/${chatbot.id}/config/customization?`, {
            method: "PATCH",
            body: formData,
        });

        setIsSaving(false)

        if (!response?.ok) {
            if (response.status === 400) {
                return toast({
                    title: "Something went wrong.",
                    description: await response.text(),
                    variant: "destructive",
                })
            } else if (response.status === 402) {
                return toast({
                    title: "Chatbot not customizable.",
                    description: "Please upgrade to a higher plan.",
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
    }

    return (
        <div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
                    <div>
                        <h3 className="mb-4 text-lg font-medium">Chatbot Customizations</h3>
                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="displayBranding"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">
                                                ClubConnect Branding
                                            </FormLabel>
                                            <FormDescription>
                                                Remove &quot;Powered by ClubConnect&quot; from the assistant.
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="chatTitle"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col items-left justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">
                                                Chatbox Title
                                            </FormLabel>
                                            <FormDescription>
                                                Change the chatbox title.
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                value={field.value}
                                                onChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="chatMessagePlaceHolder"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col items-left justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">
                                                Chatbox Input Message Placeholder Text
                                            </FormLabel>
                                            <FormDescription>
                                                Update the placeholder text in the chatbox input.
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                value={field.value}
                                                onChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                name="bubbleColor"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col items-left justify-between rounded-lg border p-4">
                                        <div className="space-y-4">
                                            <h1>Customize Your Assistant Widget</h1>
                                            <div className="flex">
                                                <div className="flex flex-col w-full justify space-y-4">
                                                    <div className="space-y-0.5">
                                                        <FormLabel className="text-base">
                                                            Assistant Background Bubble Color
                                                        </FormLabel>
                                                        <FormDescription>
                                                            Select the color you want to use for your assistant bubble
                                                        </FormDescription>
                                                        <FormControl>
                                                            <GradientPicker background={bubbleColor} setBackground={setBubbleColor} />
                                                        </FormControl>
                                                    </div>

                                                    <div className="space-y-0.5">
                                                        <FormLabel className="text-base">
                                                            Assistant Logo Color
                                                        </FormLabel>
                                                        <FormDescription>
                                                            Select the color you want to use for your Assistant logo color
                                                        </FormDescription>
                                                        <FormControl>
                                                            <GradientPicker withGradient={false} background={bubbleLogoColor} setBackground={setBubbleLogoColor} />
                                                        </FormControl>
                                                    </div>
                                                </div>
                                                <div className="flex w-full items-center text-center justify-center">
                                                    <div className="ml-4 mr-4 shadow-lg border bg-white border-gray-200 rounded-full p-4" style={{ background: bubbleColor }}>
                                                        <Icons.message style={{ color: bubbleLogoColor }} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                name="headerColor"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col items-left justify-between rounded-lg border p-4">
                                        <div className="space-y-4">
                                            <h1>Customize Your Chatbox Header</h1>
                                            <div className="flex">
                                                <div className="flex flex-col w-full justify space-y-4">
                                                    <div className="space-y-0.5">
                                                        <FormLabel className="text-base">
                                                            Assistant Header Background Color
                                                        </FormLabel>
                                                        <FormDescription>
                                                            Select the color you want to use for your chatbox header background
                                                        </FormDescription>
                                                        <FormControl>
                                                            <GradientPicker background={chatHeaderBackgroundColor} setBackground={setChatHeaderBackgroundColor} />
                                                        </FormControl>
                                                    </div>

                                                    <div className="space-y-0.5">
                                                        <FormLabel className="text-base">
                                                        Assistant Header Text Color
                                                        </FormLabel>
                                                        <FormDescription>
                                                            Select the color you want to use for your assistant header text color
                                                        </FormDescription>
                                                        <FormControl>
                                                            <GradientPicker withGradient={false} background={chatHeaderTextColor} setBackground={setChatHeaderTextColor} />
                                                        </FormControl>
                                                    </div>
                                                </div>
                                                <div className="flex w-full items-center text-center justify-center">
                                                    <div style={{ background: chatHeaderBackgroundColor }} className="flex rounded-t-lg shadow justify-between items-center p-4">
                                                        <h3 style={{ color: chatHeaderTextColor }} className="text-xl font-semibold">Chat with our AI</h3>
                                                        <div>
                                                            <Button variant="ghost">
                                                                <Icons.close style={{ color: chatHeaderTextColor }} className="h-5 w-5 text-gray-500" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </FormItem>
                                )}
                            />
                            <FormField
    name="chatbotLogo"
    render={({ field }) => (
        <FormItem className="flex flex-col items-left justify-between rounded-lg border p-4">
            <div className="space-y-4">
                <h1>Image</h1>
                <div className="flex">
                    <div className="flex flex-col w-full justify space-y-4">
                        <div className="space-y-0.5">
                            <FormLabel className="text-base">
                                Choose assistant image
                            </FormLabel>
                            <FormDescription>
                                Choose the image you want to use for your assistant. The image will be displayed as the assistant&apos;s profile picture.
                                Image size should be optimal for the display size (e.g., 32x32 pixels).
                            </FormDescription>
                            <FormControl>
                                <div className="space-y-2">
                                    <Input
                                        name="file"
                                        ref={inputFileRef}
                                        type="file"
                                        onChange={handleFileChange}  // This is where the new handleFileChange function comes into play
                                    />
                                    <div className="flex space-x-2 flex-row">
                                        <Checkbox
                                            onCheckedChange={() => setUseDefaultImage(!useDefaultImage)}
                                            checked={useDefaultImage}
                                        ></Checkbox>
                                        <span className="text-sm text-muted-foreground">Use default assistant image</span>
                                    </div>
                                    {imagePreviewUrl && (
                                        <div className="mt-4">
                                            <Image
                                                src={imagePreviewUrl}
                                                alt="Assistant Preview"
                                                width={64}
                                                height={64}
                                                className="rounded-full"
                                            />
                                        </div>
                                    )}
                                </div>
                            </FormControl>
                        </div>
                    </div>
                    <div className="flex w-full items-center text-center justify-center">
                        {/* The preview or the default icon is shown here */}
                        {imagePreviewUrl ? (
                            <Image
                                className="border rounded shadow"
                                width={64}
                                height={64}
                                src={imagePreviewUrl}
                                alt="Assistant Logo"
                            />
                        ) : (
                            <Icons.bell className="h-10 w-10" />
                        )}
                    </div>
                </div>
            </div>
        </FormItem>
    )}
/>

<FormField
    name="assistantImageBackgroundColor"
    render={({ field }) => (
        <FormItem className="flex flex-col items-left justify-between rounded-lg border p-4">
            <div className="space-y-4">
                <h1>Customize Your Assistant Image Background</h1>
                <div className="flex">
                    <div className="flex flex-col w-full justify space-y-4">
                        <div className="space-y-0.5">
                            <FormLabel className="text-base">
                                Assistant Image Background Color
                            </FormLabel>
                            <FormDescription>
                                Select the color you want to use for the background of the assistant image
                            </FormDescription>
                            <FormControl>
                                <GradientPicker
                                    background={assistantImageBackgroundColor}
                                    setBackground={(newColor) => {
                                        setAssistantImageBackgroundColor(newColor);
                                        // Additionally, update any other state or perform actions when color changes.
                                    }}
                                />
                            </FormControl>
                        </div>
                    </div>
                    <div className="flex w-full items-center text-center justify-center">
                        <div
                            style={{ background: assistantImageBackgroundColor }}
                            className="flex rounded-lg shadow justify-center items-center p-4"
                        >
                            {/* The image preview is displayed within a div that takes the background color from the picker */}
                            <Image
                                src={chatbotLogoURL || "/default-assistant-logo.png"}  // Ensures there's a default if no URL is provided
                                alt="Assistant Logo"
                                width={64}
                                height={64}
                                className="rounded-full"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </FormItem>
    )}
/>

                        </div>
                    </div>
                    <button
                        type="submit"
                        className={buttonVariants()}
                        disabled={isSaving}
                    >
                        {isSaving && (
                            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        <span>Save</span>
                    </button>
                </form>
            </Form>
        </div>
    )
}