import { getServerSession } from "next-auth/next"
import { z } from "zod"
import * as cheerio from 'cheerio';

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

import URL from 'url';
import { put } from '@vercel/blob';
import OpenAI from "openai";
import { getUserSubscriptionPlan } from "@/lib/subscription";
import { RequiresHigherPlanError } from "@/lib/exceptions";

const routeContextSchema = z.object({
    params: z.object({
        crawlerId: z.string(),
    }),
})

export const maxDuration = 300;

async function verifyCurrentUserHasAccessToCrawler(crawlerId: string) {
    const session = await getServerSession(authOptions)

    const count = await db.crawler.count({
        where: {
            userId: session?.user?.id,
            id: crawlerId,
        },
    })

    return count > 0
}

async function fetchHtml(url: string) {
    const jinaReaderUrl = `https://r.jina.ai/${encodeURIComponent(url)}`;
    try {
        const response = await fetch(jinaReaderUrl);
        return await response.text();
    } catch (error) {
        console.error('Failed to fetch URL via Jina Reader:', url, error);
        return null;
    }
}

async function crawl(url: string, selector: string, urlMatch: string, maxPagesToCrawl: number, visited = new Set(), pageCount = 0) {
    if (visited.has(url) || !url.includes(urlMatch) || pageCount >= maxPagesToCrawl) return [];

    console.log('Crawling URL:', url);

    visited.add(url);
    pageCount++;

    const html = await fetchHtml(url);
    if (!html) return [];

    const $ = cheerio.load(html);
    const links = $('a').map((i, el) => $(el).attr('href')).get();
    const validLinks = links.map(link => {
        if (link && link.startsWith('/')) {
            const baseUrl = new URL.URL(url).origin;
            return baseUrl + link;
        }
        return link;
    }).filter(link => link && link.startsWith('http'));

    const title = $('title').text();
    const selectedHtml = $(selector).text() || '';

    const result = [{ title, url, html: selectedHtml }];

    for (const link of validLinks) {
        if (pageCount < maxPagesToCrawl) {
            const newResults = await crawl(link, selector, urlMatch, maxPagesToCrawl, visited, pageCount);
            result.push(...newResults);
            pageCount += newResults.length;
        }
    }

    return result;
}


export async function GET(
    req: Request,
    context: z.infer<typeof routeContextSchema>
) {
    try {
        const session = await getServerSession(authOptions)
        // Validate the route params.
        const { params } = routeContextSchema.parse(context)

        if (!(await verifyCurrentUserHasAccessToCrawler(params.crawlerId))) {
            return new Response(null, { status: 403 })
        }

        const { user } = session
        const subscriptionPlan = await getUserSubscriptionPlan(user.id)

        const count = await db.file.count({
            where: {
                userId: user.id,
            },
        })

        if (count >= subscriptionPlan.maxFiles) {
            throw new RequiresHigherPlanError()
        }

        const openAIConfig = await db.openAIConfig.findUnique({
            select: {
                globalAPIKey: true,
                id: true,
            },
            where: {
                userId: session?.user?.id
            }
        })

        if (!openAIConfig?.globalAPIKey) {
            return new Response("Missing OpenAI API key", { status: 400, statusText: "Missing OpenAI API key" })
        }

        const openai = new OpenAI({
            apiKey: openAIConfig?.globalAPIKey
        })

        const crawler = await db.crawler.findFirst({
            select: {
                id: true,
                maxPagesToCrawl: true,
                urlMatch: true,
                crawlUrl: true,
                selector: true,
                name: true,
            },
            where: {
                id: params.crawlerId,
            },
        })

        if (!crawler) {
            return new Response(null, { status: 404 })
        }

        const content = await crawl(crawler.crawlUrl, crawler.selector, crawler.maxPagesToCrawl, crawler.urlMatch)
        if (!content) {
            console.error('Failed to crawl URL:', crawler.crawlUrl);
            return new Response(null, { status: 500 })
        }

        // if content is only spaces return 500
        if (content.toString().trim().length === 0) {
            console.error('Failed to crawl URL contains only spaces:', crawler.crawlUrl + ' - No content found');
            return new Response(null, { status: 500 })
        }

        const date = new Date()
        const fileName = crawler.name.toLowerCase().replace(/\s/g, "-") + '-' + date.toISOString() + ".json"

        // Add file to blob
        const blob = await put(fileName, JSON.stringify(content), {
            access: "public",
            token: process.env.BLOB_READ_WRITE_TOKEN
        })

        // Add file to OpenAI
        const file = await openai.files.create(
            { file: await fetch(blob.url), purpose: 'assistants' }
        )

        // Add file to database
        await db.file.create({
            data: {
                name: fileName,
                blobUrl: blob.url,
                openAIFileId: file.id,
                userId: session?.user?.id,
                crawlerId: crawler.id,
            }
        })

        return new Response(null, { status: 204 })
    } catch (error) {
        console.log(error)
        if (error instanceof z.ZodError) {
            return new Response(JSON.stringify(error.issues), { status: 422 })
        }

        if (error instanceof RequiresHigherPlanError) {
            return new Response("Requires Higher Plan", { status: 402 })
        }

        return new Response(null, { status: 500 })
    }
}