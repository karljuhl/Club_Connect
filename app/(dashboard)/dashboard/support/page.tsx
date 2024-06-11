import { DashboardHeader } from "@/components/header"
import { Icons } from "@/components/icons"
import { DashboardShell } from "@/components/shell"
import { buttonVariants } from "@/components/ui/button"
import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import Link from "next/link"

export const metadata = {
    title: `${siteConfig.name} - Support`,
}

export default function SupportPage() {
    return (
        <DashboardShell>
            <DashboardHeader heading="Support">
                <div className="flex justify-between items-center w-full">
                    <div className="flex space-x-4">
                    <Link
                            href="/roadmap"
                            className={cn(
                                buttonVariants({ variant: "primary" }),
                                "hover:bg-gray-200"
                            )}
                        >
                            <>
                                <Icons.bulb className="mr-2 h-4 w-4" />
                                Need a feature, have a suggestion?
                            </>
                        </Link>
                    </div>
                    <div className="mt-4">
                    <Link
                            href="/dashboard"
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
                    </div>
                </div>
            </DashboardHeader>
            <div >
                <p className="text-lg font-semibold">How can we help you?</p>
                <p className="text-muted-foreground">
                    First, before reaching out you can always try our assistant. Our Assistant knows a lot about our platform and may be able to help you, if not an option will pop up in chat to &apos;Contact our Team&apos;.
                </p>
                <div className="min-w-[85%] min-h-[15rem] text-left items-left pt-6">
                    <iframe
                        src="/embed/clq6m06gc000114hm42s838g2/window?chatbox=false"
                        className="overflow-hidden border border-1 rounded-lg shadow-lg w-full h-[65vh]"
                        allowFullScreen allow="clipboard-read; clipboard-write"
                    ></iframe>
                </div>
            </div>
        </DashboardShell>
    )
}
