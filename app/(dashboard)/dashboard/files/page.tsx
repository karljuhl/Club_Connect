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
              <div className="flex flex-col">
                <div className="mb-4 flex items-center justify-between px-2">
                    <Label className="text-lg">Uploaded files</Label>
                    <FileUploadButton variant={"outline"} />
                </div>
                    <Accordion className="w-full mb-4" type="multiple">
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