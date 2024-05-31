"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { cn } from "@/lib/utils"
import { crawlerSchema } from "@/lib/validations/crawler"
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


type FormData = z.infer<typeof crawlerSchema>

export function NewCrawlerForm({ className, ...props }: React.HTMLAttributes<HTMLFormElement>) {
    const router = useRouter()
    const form = useForm<FormData>({
        resolver: zodResolver(crawlerSchema),
        defaultValues: {
            selector: "body"
        }
    })
    const [isSaving, setIsSaving] = React.useState<boolean>(false)

    async function onSubmit(data: FormData) {
        console.log("Form submit started", data);
        setIsSaving(true)

        const response = await fetch(`/api/crawlers`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: data.name,
                crawlUrl: data.crawlUrl,
                selector: data.selector,
                urlMatch: data.urlMatch
            }),
        })

        setIsSaving(false)

        if (!response?.ok) {
            if (response.status === 402) {
                return toast({
                    title: "Crawler limit reached.",
                    description: "Please upgrade to the a higher plan.",
                    variant: "destructive",
                })
            }

            return toast({
                title: "Something went wrong.",
                description: "Your crawler was not saved. Please try again.",
                variant: "destructive",
            })
        }

        toast({
            description: "Your crawler has been saved.",
        })
        const json = await response.json()
        router.push(`/dashboard/crawlers/${json.id}/crawl`)
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
                        <CardTitle>Create new crawler</CardTitle>
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
                                        id="name"
                                        onChange={field.onChange}
                                        size={32}
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
                            name="crawlUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel htmlFor="crawlUrl">
                                        Crawling URL
                                    </FormLabel >
                                    <Input
                                        onChange={field.onChange}
                                        id="crawlUrl"
                                    />
                                    <FormDescription>
                                        The URL(s) that we will crawl. Seperate multiples with a comma and space.
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
                            <span>Create</span>
                        </button>
                    </CardFooter>
                </Card>
            </form>
        </Form >
    )
}
