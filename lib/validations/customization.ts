import { z } from "zod";
export const customizationSchema = z.object({
    displayBranding: z.boolean().default(false).optional(),
    chatTitle: z.string().default("").optional(),
    chatMessagePlaceHolder: z.string().default("").optional(),
    bubbleColor: z.string().default("").optional(),
    bubbleTextColor: z.string().default("").optional(),
    chatHeaderBackgroundColor: z.string().default("").optional(),
    chatHeaderTextColor: z.string().default("").optional(),
    userReplyBackgroundColor: z.string().default(""),
    userReplyTextColor: z.string().default(""),
    chatbotLogoFilename: z.string().default("").optional(),
    chatbotLogo: z.any(),
    assistantImageBackgroundColor: z.string().default("").optional(),
})


export const customizationStringBackendSchema = z.object({
    displayBranding: z.string().default('false').optional(),
    chatbotLogoFilename: z.string().default("").optional(),
    chatTitle: z.string().default("").optional(),
    chatMessagePlaceHolder: z.string().default("").optional(),
    bubbleColor: z.string().default("").optional(),
    bubbleTextColor: z.string().default("").optional(),
    chatHeaderBackgroundColor: z.string().default("").optional(),
    chatHeaderTextColor: z.string().default("").optional(),
    userReplyBackgroundColor: z.string().default(""),
    userReplyTextColor: z.string().default(""),
    chatbotLogo: z.any(),
    assistantImageBackgroundColor: z.string().default("").optional(),
})