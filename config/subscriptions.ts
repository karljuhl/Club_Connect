import { SubscriptionPlan } from "@/types"

export const freePlan: SubscriptionPlan = {
    name: "FREE",
    description: "The FREE plan is limited to 1 chatbot, 1 crawler, 1 file and 350 messages per month.",
    stripePriceId: "",

    maxChatbots: 1,
    maxCrawlers: 1,
    maxFiles: 1,
    unlimitedMessages: false,
    maxMessagesPerMonth: 350,
    basicCustomization: false,
    userInquiries: false,
    phoneHandoff: false,

    price: 0,
}

export const hobbyPlan: SubscriptionPlan = {
    name: "WEB",
    description: "The WEB plan is limited 1 chatbot, 2 crawlers, 3 files and unlimited messages.",
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_WEB_PRICE_ID || "",

    maxChatbots: 1,
    maxCrawlers: 2,
    maxFiles: 3,
    unlimitedMessages: true,
    maxMessagesPerMonth: undefined,
    basicCustomization: true,
    userInquiries: false,
    phoneHandoff: false,

    price: 87,
}

export const managedWeb: SubscriptionPlan = {
    name: "MANAGED WEB",
    description: "The MANAGED WEB plan has 2 chatbots, 2 crawlers, 4 files, unlimited messages and with our experienced team helping you set up and keeping a close eye on the day-to-day performance.",
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_MW_PRICE_ID || "",

    maxChatbots: 2,
    maxCrawlers: 2,
    maxFiles: 4,
    unlimitedMessages: true,
    maxMessagesPerMonth: undefined,
    basicCustomization: true,
    userInquiries: true,
    phoneHandoff: true,

    premiumSupport: true,

    price: 197,
}

export const basicPlan: SubscriptionPlan = {
    name: "WEB & PHONE",
    availability: "COMING SOON",
    description: "The WEB & PHONE plan has 2 chatbots, 3 crawlers, 6 files and unlimited messages.",
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_WANDP_PRICE_ID || "",

    maxChatbots: 4,
    maxCrawlers: 4,
    maxFiles: 6,
    unlimitedMessages: true,
    maxMessagesPerMonth: undefined,
    basicCustomization: true,
    userInquiries: true,
    phoneHandoff: true,

    premiumSupport: true,

    price: 457,
}

export const proPlan: SubscriptionPlan = {
    name: "MANAGED W&P",
    availability: "COMING SOON",
    description: "The MANAGED W&P plan has 4 chatbots, 4 crawlers, 6 files, unlimited messages and with our experienced team helping you set up and keeping a close eye on the day-to-day performance.",
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_MWANDP_PRICE_ID || "",

    maxChatbots: 4,
    maxCrawlers: 4,
    maxFiles: 6,
    unlimitedMessages: true,
    maxMessagesPerMonth: undefined,
    basicCustomization: true,
    userInquiries: true,
    phoneHandoff: true,

    premiumSupport: true,

    price: 1157,
}

export const HIDDEN: SubscriptionPlan = {
    name: "HIDDEN",
    description: "all from MANAGED W&P.",
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_HIDDEN_PRICE_ID || "",

    maxChatbots: 21,
    maxCrawlers: 21,
    maxFiles: 100,
    unlimitedMessages: true,
    maxMessagesPerMonth: undefined,
    basicCustomization: true,
    userInquiries: true,
    phoneHandoff: true,

    premiumSupport: true,

    price: 1,
}