import { getServerSession } from "next-auth/next";
import { z } from "zod";
import fetch from "node-fetch";
import { JSDOM } from "jsdom";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { put } from "@vercel/blob";
import OpenAI from "openai";
import { getUserSubscriptionPlan } from "@/lib/subscription";
import { RequiresHigherPlanError } from "@/lib/exceptions";

const routeContextSchema = z.object({
    params: z.object({
        crawlerId: z.string(),
    }),
});

export const maxDuration = 300;

async function verifyCurrentUserHasAccessToCrawler(crawlerId: string) {
    const session = await getServerSession(authOptions);
    const count = await db.crawler.count({
        where: {
            userId: session?.user?.id,
            id: crawlerId,
        },
    });
    return count > 0;
}

async function fetchContent(url: string) {
    const strippedUrl = url.replace(/^https?:\/\//, '');
    const encodedUrl = encodeURIComponent(strippedUrl);
    const jinaReaderUrl = `https://r.jina.ai/${encodedUrl}`;
    try {
        const response = await fetch(jinaReaderUrl);
        return await response.text();
    } catch (error) {
        console.error('Failed to fetch URL via Jina Reader:', jinaReaderUrl, error);
        return null;
    }
}

async function getAllUrls(url, baseUrl) {
    let urls = new Set();
    async function crawl(url) {
        try {
            const response = await fetch(url);
            const html = await response.text();
            const dom = new JSDOM(html);
            const { document } = dom.window;
            const links = [...document.querySelectorAll('a')].map(link => new URL(link.href, url).href);

            for (const link of links) {
                if (link.startsWith(baseUrl) && !urls.has(link)) {
                    urls.add(link);
                    await crawl(link);
                }
            }
        } catch (error) {
            console.error('Error crawling URL:', url, error);
        }
    }

    await crawl(url);
    return Array.from(urls);
}

export async function GET(req, context) {
    try {
        const session = await getServerSession(req, null, authOptions);
        const { params } = routeContextSchema.parse(context);

        if (!(await verifyCurrentUserHasAccessToCrawler(params.crawlerId))) {
            return new Response(null, { status: 403 });
        }

        const crawler = await db.crawler.findFirst({
            where: { id: params.crawlerId },
        });

        if (!crawler) {
            return new Response(null, { status: 404 });
        }

        const urls = await getAllUrls(crawler.crawlUrl, new URL(crawler.crawlUrl).origin);
        const contents = await Promise.all(urls.map(url => fetchContent(url)));
        const combinedContent = contents.filter(content => content !== null).join("\n");

        const date = new Date();
        const fileName = `${crawler.name.toLowerCase().replace(/\s/g, "-")}-${date.toISOString()}.json`;
        const blob = await put(fileName, JSON.stringify({ content: combinedContent }), {
            access: "public",
            token: process.env.BLOB_READ_WRITE_TOKEN
        });

        const openAIConfig = await db.openAIConfig.findUnique({
            select: { globalAPIKey: true },
            where: { userId: session.user.id }
        });

        if (!openAIConfig?.globalAPIKey) {
            return new Response("Missing OpenAI API key", { status: 400 });
        }

        const openai = new OpenAI({ apiKey: openAIConfig.globalAPIKey });

        const file = await openai.files.create({
            file: await fetch(blob.url), purpose: 'assistants'
        });

        await db.file.create({
            data: {
                name: fileName,
                blobUrl: blob.url,
                openAIFileId: file.id,
                userId: session.user.id,
                crawlerId: crawler.id,
            }
        });

        return new Response(null, { status: 204 });
    } catch (error) {
        console.error('Error during GET operation:', error);
        if (error instanceof z.ZodError) {
            return new Response(JSON.stringify(error.issues), { status: 422 });
        } else if (error instanceof RequiresHigherPlanError) {
            return new Response("Requires Higher Plan", { status: 402 });
        } else {
            return new Response(null, { status: 500 });
        }
    }
}
