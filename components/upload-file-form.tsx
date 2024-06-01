"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { cn } from "@/lib/utils"
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
import { fileUploadSchema } from "@/lib/validations/fileUpload"
import { useRef } from "react"
import { AccordionTrigger, AccordionContent, AccordionItem, Accordion } from "@/components/ui/accordion"

interface UploadFileFormProps extends React.HTMLAttributes<HTMLFormElement> { }

type FormData = z.infer<typeof fileUploadSchema>

export function UploadFileForm({ className, ...props }: UploadFileFormProps) {
    const router = useRouter()
    const inputFileRef = useRef<HTMLInputElement>(null);

    const form = useForm<FormData>({
        resolver: zodResolver(fileUploadSchema),
    })
    const [isSaving, setIsSaving] = React.useState<boolean>(false)

    async function onSubmit(data: FormData) {
        setIsSaving(true)

        if (!inputFileRef.current?.files) {
            throw new Error('No file selected');
        }

        const file = inputFileRef.current.files[0];

        const response = await fetch(`/api/upload?filename=${file.name}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: file,
        })

        setIsSaving(false)

        if (!response?.ok) {
            if (response.status === 400) {
                return toast({
                    title: "Invalid request",
                    description: await response.text(),
                    variant: "destructive",
                })
            }

            if (response.status === 402) {
                return toast({
                    title: "File limit reached.",
                    description: "Please upgrade to the a higher plan.",
                    variant: "destructive",
                })
            }

            return toast({
                title: "Something went wrong.",
                description: "Your file was not uploaded. Please try again.",
                variant: "destructive",
            })
        }

        toast({
            description: "Your file has been uploaded.",
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
                        <CardTitle>Upload File</CardTitle>
                        <CardDescription>
                            Upload a file to be used for training.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex flex-col">
                            <Accordion className="w-full mt-2 mb-2" type="multiple">
                                <AccordionItem value="item-0">
                                    <AccordionTrigger className="hover:underline-none text-muted-foreground">
                                        Best Practices for Creating your File
                                    </AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground">
                                    <p>The document which you are creating is what your Front-Desk Assistant will use as the source knowledge document and will be used to answer customers&apos; questions and get them pointed in the right direction. From a high-level view, your document should include services/products offered, rates, policies etc...</p>
                                        <ul className="list-disc pl-4">
                                            <li>What are the services/products offered?</li>
                                            <li>What are the rates for members/visitors for the different services?</li>
                                            <li>Do customers need accounts? How can they troubleshoot issues like resetting passwords, adding a facility etc...</li>
                                            <li>What policies exist for your facility: sign-up, weather, cancellation, refunds etc...</li>
                                            <li>Is there any needed information that is not covered above i.e. recommending partner services, offering special deals/packages, recommended contacts for certain topics such as facility rental, tournaments, other CX items...</li>
                                        </ul>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </div>
                        <FormField
                            control={form.control}
                            name="file"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel htmlFor="file">
                                        File
                                    </FormLabel>
                                    <Input
                                        type="file"
                                        ref={inputFileRef}
                                        onChange={field.onChange}
                                        id="file"
                                    />
                                    <FormDescription>
                                        the file to be used for training.
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
                            <span>Upload</span>
                        </button>
                    </CardFooter>
                </Card>
            </form>
        </Form >
    )
}