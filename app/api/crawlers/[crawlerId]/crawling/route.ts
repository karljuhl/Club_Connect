import { getServerSession } from "next-auth/next";
import { z } from "zod";

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
    console.log("Original URL:", url); // Log the original URL
    const encodedUrl = encodeURIComponent(url); // Ensure URL is encoded
    console.log("Encoded URL:", encodedUrl); // Log the encoded URL

    const jinaReaderUrl = `https://r.jina.ai/${encodedUrl}`;
    console.log("Full Jina Reader URL:", jinaReaderUrl); // Log the full URL to be requested

    try {
        const response = await fetch(jinaReaderUrl);
        const text = await response.text();
        console.log("Response from Jina Reader:", text); // Log the response from the API
        return text;
    } catch (error) {
        console.error('Failed to fetch URL via Jina Reader:', jinaReaderUrl, error);
        return null;
    }
}


export async function GET(req: Request, context: z.infer<typeof routeContextSchema>) {
    try {
        const session = await getServerSession(authOptions);
        const { params } = routeContextSchema.parse(context);

        if (!(await verifyCurrentUserHasAccessToCrawler(params.crawlerId))) {
            return new Response(null, { status: 403 });
        }

        const { user } = session;
        const subscriptionPlan = await getUserSubscriptionPlan(user.id);
        const count = await db.file.count({
            where: {
                userId: user.id,
            },
        });

        if (count >= subscriptionPlan.maxFiles) {
            throw new RequiresHigherPlanError();
        }

        const openAIConfig = await db.openAIConfig.findUnique({
            select: {
                globalAPIKey: true,
                id: true,
            },
            where: {
                userId: session?.user?.id
            }
        });

        if (!openAIConfig?.globalAPIKey) {
            return new Response("Missing OpenAI API key", { status: 400, statusText: "Missing OpenAI API key" });
        }

        const crawler = await db.crawler.findFirst({
            select: {
                id: true,
                crawlUrl: true,
                name: true,
            },
            where: {
                id: params.crawlerId,
            },
        });

        if (!crawler) {
            return new Response(null, { status: 404 });
        }

        const content = await fetchContent(crawler.crawlUrl);
if (!content) {
    console.error('Failed to fetch content:', crawler.crawlUrl);
    return new Response(null, { status: 500 });
}

try {
    const parsedContent = JSON.parse(content);
    if (parsedContent && parsedContent.error) {
        console.error('Error in fetched content:', parsedContent.error);
        return new Response(JSON.stringify(parsedContent.error), { status: 500 });
    }
} catch (e) {
    console.error('Error parsing content:', e);
}

if (content.trim().length === 0) {
    console.error('Content fetched contains only spaces:', crawler.crawlUrl + ' - No content found');
    return new Response(null, { status: 500 });
}


        const date = new Date();
        const fileName = crawler.name.toLowerCase().replace(/\s/g, "-") + '-' + date.toISOString() + ".json";

        const blob = await put(fileName, JSON.stringify({ content }), {
            access: "public",
            token: process.env.BLOB_READ_WRITE_TOKEN
        });

        const file = await openai.files.create({
            file: await fetch(blob.url), purpose: 'assistants'
        });

        await db.file.create({
            data: {
                name: fileName,
                blobUrl: blob.url,
                openAIFileId: file.id,
                userId: session?.user?.id,
                crawlerId: crawler.id,
            }
        });

        return new Response(null, { status: 204 });
    } catch (error) {
        console.error('Error during GET operation:', error);
        if (error instanceof z.ZodError) {
            return new Response(JSON.stringify(error.issues), { status: 422 });
        }

        if (error instanceof RequiresHigherPlanError) {
            return new Response("Requires Higher Plan", { status: 402 });
        }

        return new Response(null, { status: 500 });
    }
}
