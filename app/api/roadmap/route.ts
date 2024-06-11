// api/roadmap.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';  // Zod for validation
import { sendFeatureEmail } from "@/lib/emails/send-feature";

// Define a schema for the incoming request body
const SuggestionSchema = z.object({
    suggestion: z.string().min(1, "Suggestion cannot be empty"),
});

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
    console.log('Received method:', req.method);  // Log the method of the request

    if (req.method === 'POST') {
        try {
            // Validate the request body
            const validatedBody = SuggestionSchema.parse(req.body);
            console.log('Validated body:', validatedBody);  // Log the validated body
            const { suggestion } = validatedBody;

            // Send the email with the suggestion
            console.log('Sending suggestion email:', suggestion);
            await sendFeatureEmail(suggestion);

            // Respond with success if email is sent
            console.log('Suggestion email sent successfully');
            res.status(200).json({ message: 'Suggestion sent successfully' });
        } catch (error) {
            if (error instanceof z.ZodError) {
                // Log validation errors
                console.error('Validation failed:', error.errors);
                res.status(400).json({ errors: error.errors });
            } else {
                // Log other types of errors
                console.error('Error processing request:', error);
                res.status(500).json({ error: 'Failed to send suggestion' });
            }
        }
    } else {
        // Log incorrect HTTP method usage
        console.log('Incorrect HTTP method', req.method);
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
