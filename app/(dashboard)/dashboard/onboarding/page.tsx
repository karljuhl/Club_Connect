import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { getCurrentUser } from "@/lib/session";
import { DashboardHeader } from "@/components/header";
import { DashboardShell } from "@/components/shell";
import { UploadFileForm } from "@/components/upload-file-form";
import { NewChatbotForm } from "@/components/new-chatbot-form";

import { db } from "@/lib/db";
import { siteConfig } from "@/config/site";
import { Icons } from "@/components/icons";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Chat } from "@/components/chat";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: `${siteConfig.name} - Onboarding`,
  description: "Onboarding - Create your first chatbot.",
};

export default async function OnboardingPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect(authOptions?.pages?.signIn || "/login");
  }

  let currentStep = 1; // Start from the file upload now

  const files = await db.file.count({
    where: {
      userId: user.id,
    },
  });

  if (files > 0) {
    currentStep = 2; // Move to creating the chatbot
  }

  const chatbot = await db.chatbot.findFirst({
    where: {
      userId: user.id,
    },
  });

  if (chatbot) {
    currentStep = 3; // Move to chatting with the chatbot
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Onboarding" text="Step-by-Step Guide for Building Your First Chatbot">
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
      </DashboardHeader>
      <div className="flex">
        <aside className="w-64 h-full border-r">
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Progress Steps</h2>
            <div className="space-y-6">
              <Card className={currentStep > 1 ? "border border-green-500 p-4" : "p-4"}>
                <CardHeader>
                  <div className="flex items-center">
                    <Badge className="mr-2">1</Badge>
                    <h3 className="text-lg font-medium">Upload file</h3>
                  </div>
                </CardHeader>
                {currentStep == 1 &&
                  <CardContent>
                    <p className="text-sm text-gray-500">
                      Upload a file for your chatbot to use. This file can be a PDF, a Word document, or a text file and will be used to train your chatbot.
                    </p>
                  </CardContent>
                }
              </Card>
              <Card className={currentStep > 2 ? "border border-green-500 p-4" : "p-4"}>
                <CardHeader>
                  <div className="flex items-center">
                    <Badge className="mr-2">2</Badge>
                    <h3 className="text-lg font-medium">Create your Chatbot</h3>
                  </div>
                </CardHeader>
                {currentStep == 2 &&
                  <CardContent>
                    <p className="text-sm text-gray-500">
                      Create your first smart chatbot.
                    </p>
                  </CardContent>
                }
              </Card>
              <Card className={currentStep > 3 ? "border border-green-500 p-4" : "p-4"}>
                <CardHeader>
                  <div className="flex items-center">
                    <Badge className="mr-2">3</Badge>
                    <h3 className="text-lg font-medium">Chat</h3>
                  </div>
                </CardHeader>
                {currentStep == 3 &&
                  <CardContent>
                    <p className="text-sm text-gray-500">
                      Chat with your chatbot for the first time! 🎉
                    </p>
                  </CardContent>
                }
              </Card>
            </div>
          </div>
        </aside>
        <main className="flex-grow p-6">
          {currentStep == 1 &&
            <UploadFileForm />
          }
          {currentStep == 2 &&
            <NewChatbotForm user={user} isOnboarding={true} />
          }
          {currentStep == 3 &&
            <Chat chatbot={chatbot!} defaultMessage=""></Chat>
          }
        </main>
      </div>
    </DashboardShell >
  );
}
