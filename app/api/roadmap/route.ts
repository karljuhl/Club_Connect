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
        console.log('Request Body:', requestBody); // Log the request body to verify its structure
        const { suggestion } = SuggestionSchema.parse(requestBody);

        console.log('Parsed Suggestion:', suggestion); // Ensure suggestion is correctly parsed
        await sendFeatureEmail({ suggestion, name: null, email: null });
        return new NextResponse(JSON.stringify({ message: 'Thank you for your Suggestion' }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error('Error occurred:', error); // Detailed error logging
        if (error instanceof z.ZodError) {
            return new NextResponse(JSON.stringify({ errors: error.errors }), { status: 400 });
        }
        return new NextResponse(JSON.stringify({ error: 'Failed to send suggestion' }), { status: 500 });
    }
}
