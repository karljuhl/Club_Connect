
import { z } from 'zod';
import { sendFeatureEmail } from "@/lib/emails/send-feature";
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const SuggestionSchema = z.object({
    suggestion: z.string().min(1, "Suggestion cannot be empty"),
});

export async function POST(request: NextRequest) {
    try {
        const requestBody = await request.json();
        const { suggestion } = SuggestionSchema.parse(requestBody);

        await sendFeatureEmail(suggestion);
        return new NextResponse(JSON.stringify({ message: 'Suggestion sent successfully' }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse(JSON.stringify({ errors: error.errors }), { status: 400 });
        }
        return new NextResponse(JSON.stringify({ error: 'Failed to send suggestion' }), { status: 500 });
    }
}
