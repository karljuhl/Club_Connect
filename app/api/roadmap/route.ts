// api/roadmap.ts
import { z } from 'zod';  // Zod for validation
import { sendFeatureEmail } from "@/lib/emails/send-feature";

// Define a schema for the incoming request body
const SuggestionSchema = z.object({
    suggestion: z.string().min(1, "Suggestion cannot be empty"),
});

export async function POST(req: Request) {
    console.log('Received method:', req.method);  // Log the method of the request

    if (req.method === 'POST') {
        try {
            // Parse and validate the request body
            const requestBody = await req.json();
            const validatedBody = SuggestionSchema.parse(requestBody);
            console.log('Validated body:', validatedBody);  // Log the validated body
            const { suggestion } = validatedBody;

            // Send the email with the suggestion
            console.log('Sending suggestion email:', suggestion);
            await sendFeatureEmail(suggestion);

            // Respond with success if email is sent
            console.log('Suggestion email sent successfully');
            return new Response(JSON.stringify({ message: 'Suggestion sent successfully' }), { status: 200 });
        } catch (error) {
            if (error instanceof z.ZodError) {
                // Log validation errors
                console.error('Validation failed:', error.errors);
                return new Response(JSON.stringify({ errors: error.errors }), { status: 400 });
            } else {
                // Log other types of errors
                console.error('Error processing request:', error);
                return new Response(JSON.stringify({ error: 'Failed to send suggestion' }), { status: 500 });
            }
        }
    } else {
        // If the method is not POST, specify which methods are allowed
        console.log('Incorrect HTTP method', req.method);
        return new Response(`Method ${req.method} Not Allowed`, { status: 405, headers: { 'Allow': 'POST' } });
    }
}
