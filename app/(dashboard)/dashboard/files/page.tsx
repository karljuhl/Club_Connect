import { redirect } from "next/navigation"

import { DashboardHeader } from "@/components/header"
import { DashboardShell } from "@/components/shell"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"
import { EmptyPlaceholder } from "@/components/empty-placeholder"
import { Label } from "@/components/ui/label"
import { CrawlerCreateButton } from "@/components/crawler-create-button"
import { FileUploadButton } from "@/components/file-upload-button"
import { FileItem } from "@/components/file-items"
import { siteConfig } from "@/config/site"
import { AccordionTrigger, AccordionContent, AccordionItem, Accordion } from "@/components/ui/accordion"

export const metadata = {
    title: `${siteConfig.name} - Files`,
}

export default async function FilePage() {
    const user = await getCurrentUser()

    if (!user) {
        redirect(authOptions?.pages?.signIn || "/login")
    }

    const files = await db.file.findMany({
        select: {
            id: true,
            name: true,
            createdAt: true,
            openAIFileId: true,
            blobUrl: true,
            crawler: {
                select: {
                    id: true,
                    name: true,
                }
            }
        },
        where: {
            userId: user.id,
        },
    })

    const uploadedFiles = files.filter((file) => !file.crawler)

    const filesWithCrawler = files.filter((file) => {
        if (file.crawler) {
            return true
        }
        return false
    })


    return (
        <DashboardShell>
            <DashboardHeader heading="Files" text="List of all of your imported and crawled files.">
            </DashboardHeader>
            <div className="flex flex-col">
                <div className="mb-4 flex items-center justify-between px-2">
                    <Label className="text-lg">Uploaded files</Label>
                    <FileUploadButton variant={"outline"} />
                    <br></br>
                    <Accordion className="w-full mt-4" type="multiple">
                        <AccordionItem value="item-0">
                            <AccordionTrigger className="hover:underline-none text-black">
                                Best Practices for Creating your File
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground">
                                ClubConnect is a solution designed to help your customers while relieving pressure on your Front-Desk Team, assist with understanding facility services & offerings, and provide information to users in real-time. It allows your team to focus on enriching the experience of in-person customers, while having peace of mind that those on the website and calling are getting the answers they are looking for.
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
                {uploadedFiles.length ?
                    <div className="divide-y divide-border rounded-md border">
                        {uploadedFiles.map((file) => (
                            <FileItem key={file.id} file={file} />
                        ))
                        }
                    </div>
                    : <div className="grid gap-10">
                        <EmptyPlaceholder>
                            <EmptyPlaceholder.Icon name="folder" />
                            <EmptyPlaceholder.Title>Import a file now</EmptyPlaceholder.Title>
                            <EmptyPlaceholder.Description>
                                You don&apos;t have any files yet. Import a file.
                            </EmptyPlaceholder.Description>
                            <FileUploadButton variant={"outline"} />
                        </EmptyPlaceholder>
                    </div>
                }
                {/*<div className="my-4" />
                <div className="mb-4 flex items-center justify-between px-2">
                    <Label className="text-lg">Crawlers&apos; files</Label>
                    <CrawlerCreateButton variant={"outline"} />
                </div>
                {filesWithCrawler.length ?
                    <div className="divide-y divide-border rounded-md border">
                        {
                            filesWithCrawler.map((file) => (
                                <FileItem file={file} key={file.id} />
                            ))
                        }
                    </div>
                    :
                    <div className="grid gap-10">
                        <EmptyPlaceholder>
                            <EmptyPlaceholder.Icon name="laptop" />
                            <EmptyPlaceholder.Title>Start crawling now to import files</EmptyPlaceholder.Title>
                            <EmptyPlaceholder.Description>
                                You don&apos;t have any files yet. Start crawling.
                            </EmptyPlaceholder.Description>
                            <CrawlerCreateButton variant={"outline"} />
                        </EmptyPlaceholder>
                    </div>
                }

                */}
            </div>
        </DashboardShell>
    )
}