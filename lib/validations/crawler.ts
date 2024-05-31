import * as z from "zod"

export const crawlerSchema = z.object({
    name: z.string().min(3).max(32),
    crawlUrl: z.string(),
    urlMatch: z.string().min(1),
    selector: z.string().optional().default('body'),
    maxPagesToCrawl: z.number().optional().default(25)
})