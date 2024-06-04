"use client"

import { useState } from "react"

import { UserSubscriptionPlan } from "@/types"
import { cn } from "@/lib/utils"
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { CardContent, CardFooter } from "@/components/ui/card"
import { Icons } from "@/components/icons"
import { Button, buttonVariants } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"
import { freePlan, basicPlan, hobbyPlan, proPlan, HIDDEN, managedWeb, webplusPlan, webunlimitedPlan } from "@/config/subscriptions"

interface BillingFormProps extends React.HTMLAttributes<HTMLFormElement> {
    subscriptionPlan: UserSubscriptionPlan & {
        isCanceled: boolean
    }
}

export function BillingForm({
    subscriptionPlan,
    className,
    ...props
}: BillingFormProps) {
    const [isLoading, setIsLoading] = useState<boolean>(false)

    async function openSession(event: any, priceId: string) {
        event.preventDefault()
        setIsLoading(!isLoading)
        console.log(priceId)

        // Get a Stripe session URL.
        const response = await fetch("/api/users/stripe",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    priceId: priceId,
                }),
            }
        )

        if (!response?.ok) {
            return toast({
                title: "Something went wrong.",
                description: "Please refresh the page and try again.",
                variant: "destructive",
            })
        }

        // Redirect to the Stripe session.
        // This could be a checkout page for initial upgrade.
        // Or portal to manage existing subscription.
        const session = await response.json()
        if (session) {
            window.location.href = session.url
        }
    }
    console.log(subscriptionPlan)

    return (
        <form className={cn(className)} {...props}>
            <Card>
                <CardHeader>
                    <CardTitle>Subscription Plan</CardTitle>
                    <CardDescription>
                        You are currently on the <strong>{subscriptionPlan.name}</strong>{" "}
                        plan.
                    </CardDescription>
                </CardHeader>
                <CardContent>{subscriptionPlan.description}</CardContent>
                <CardFooter className="flex flex-col items-start space-y-2 md:flex-row md:justify-between md:space-x-0">
                    {subscriptionPlan.name !== "FREE" &&
                        <button
                            onClick={(e) => openSession(e, subscriptionPlan.stripePriceId)}
                            className={cn(buttonVariants())}
                            disabled={isLoading}
                        >
                            {isLoading && (
                                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Manage Subscription
                        </button>
                    }
                    {subscriptionPlan.name !== "FREE" ? (
                        <p className="rounded-full text-xs font-medium">
                            {subscriptionPlan.isCanceled
                                ? "Your plan will be canceled on "
                                : "Your plan renews on "}
                            {formatDate(subscriptionPlan.stripeCurrentPeriodEnd)}.
                        </p>
                    ) : null}
                </CardFooter>
            </Card>
            <Card className="border-0 shadow-0">
                <div className="flex flex-wrap gap-6 mt-8 md:gap-8">
                    {[freePlan, hobbyPlan, managedWeb, webplusPlan, webunlimitedPlan].map((plan, i) => {
                        if (plan.name === managedWeb.name) {
                            return (
                                <div key={i} className={`relative flex flex-col p-2 bg-white rounded-lg justify-between border ${plan.availability === "COMING SOON" ? "bg-gray-200" : "bg-zinc-850"} hover:shadow-sm`}>
                                {plan.availability === "COMING SOON" && (
                                    <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center text-gray-500 font-bold text-xl uppercase z-10">
                                        Coming Soon
                                    </div>
                                )}
                                    <Card className="shadow-none border-0 p-0 m-0" key={i}>
                                        <CardHeader>
                                            <CardTitle style={{ color: plan.availability === "COMING SOON" ? "gray" : "black" }}>{plan.name}</CardTitle>
                                            <CardDescription>${plan.price}/month</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <ul className="mt-4 space-y-2">
                                                <li className="flex items-center">
                                                    - {plan.maxChatbots} Assistant(s)
                                                </li>
                                                <li className="flex items-center">
                                                    - {plan.maxFiles} Files
                                                </li>
                                                {
                                                    plan.basicCustomization &&
                                                    <li className="flex items-center">
                                                        - Customizations
                                                    </li>
                                                }
                                                {
                                                    plan.unlimitedMessages ?
                                                        <li className="flex items-center">
                                                            - Unlimited Messages
                                                        </li>
                                                        :
                                                        <li className="flex items-center">
                                                            - {plan.maxMessagesPerMonth} Messages / Month
                                                        </li>
                                                }
                                                {
                                                    plan.userInquiries &&
                                                    <li className="flex items-center">
                                                        - User Inquiry
                                                    </li>
                                                }
                                            </ul>
                                        </CardContent>
                                        <CardFooter>
                                            <Button
                                                onClick={(e) => openSession(e, plan.stripePriceId)}
                                                className={cn(buttonVariants())}
                                                disabled={plan.availability === "COMING SOON" || isLoading}
                                            >
                                                {isLoading && (
                                                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                                                )}
                                                Upgrade
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                </div>)
                        }
                        return (
                            <div key={i} className={`relative flex flex-col p-2 bg-white rounded-lg justify-between border ${plan.availability === "COMING SOON" ? "bg-gray-200" : "bg-zinc-850"} hover:shadow-sm`}>
                                {plan.availability === "COMING SOON" && (
                                    <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center text-gray-500 font-bold text-xl uppercase z-10">
                                        Coming Soon
                                    </div>
                                )}
                                <Card className={`shadow-none border-0 p-0 m-0 ${plan.availability === "COMING SOON" ? "bg-gray-200" : "bg-zinc-850"}`} key={i}>
                                    <CardHeader>
                                        <CardTitle style={{ color: plan.availability === "COMING SOON" ? "gray" : "black" }}>{plan.name}</CardTitle>
                                        <CardDescription className={`${plan.availability === "COMING SOON" ? "text-gray-400" : "text-black"}`}>${plan.price}/month</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="mt-4 space-y-2" style={{ color: plan.availability === "COMING SOON" ? "gray" : "black" }}>
                                            <li className="flex items-center">
                                                - {plan.maxChatbots} Assistant(s)
                                            </li>
                                            <li className="flex items-center">
                                                - {plan.maxFiles} Files
                                            </li>
                                            {
                                                plan.basicCustomization &&
                                                <li className="flex items-center">
                                                    - Customizations
                                                </li>
                                            }
                                            {
                                                plan.unlimitedMessages ?
                                                    <li className="flex items-center">
                                                        - Unlimited Messages
                                                    </li>
                                                    :
                                                    <li className="flex items-center">
                                                        - {plan.maxMessagesPerMonth} Messages / Month
                                                    </li>
                                            }
                                            {
                                                plan.userInquiries &&
                                                <li className="flex items-center">
                                                    - User Inquiry
                                                </li>
                                            }
                                        </ul>
                                    </CardContent>
                                    <CardFooter>
                                        {plan.name !== freePlan.name &&
                                            <Button
                                                onClick={(e) => openSession(e, plan.stripePriceId)}
                                                className={cn(buttonVariants())}
                                                disabled={plan.availability === "COMING SOON" || isLoading}
                                            >
                                                {isLoading && (
                                                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                                                )}
                                                Upgrade
                                            </Button>
                                        }
                                    </CardFooter>
                                </Card>
                            </div>
                        )
                    }
                    )}
                    {/** 
                    <Card key="enterprise">
                        <CardHeader>
                            <CardTitle>Enterprise</CardTitle>
                            <CardDescription>$X/ month</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="mt-4 space-y-2">
                                <li className="flex items-center">
                                    - X Chatbots
                                </li>
                                <li className="flex items-center">
                                    - X Crawlers
                                </li>
                                <li className="flex items-center">
                                    -  X Files
                                </li>
                                <li className="flex items-center">
                                    - Unlimited Messages
                                </li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button
                                type="submit"
                                className={cn(buttonVariants())}>
                                Contact Sales
                            </Button>
                        </CardFooter>
                    </Card>
                    **/}
                </div>
            </Card>

        </form >
    )
}