import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';  // Assuming you want to use Zod for validation
import { sendFeatureEmail } from "@/lib/emails/send-feature";

// Define a schema for the incoming request body
const SuggestionSchema = z.object({
    suggestion: z.string().min(1, "Suggestion cannot be empty"),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            // Validate the request body
            const validatedBody = SuggestionSchema.parse(req.body);
            const { suggestion } = validatedBody;

            // Log the received suggestion
            console.log('Processing suggestion:', suggestion);

            // Send the email with the suggestion
            await sendFeatureEmail(suggestion);

            // Respond with success if email is sent
            res.status(200).json({ message: 'Suggestion sent successfully' });
        } catch (error) {
            if (error instanceof z.ZodError) {
                // If the error is a Zod validation error, return a 400 status code with the error details
                console.error('Validation failed:', error.errors);
                res.status(400).json({ errors: error.errors });
            } else {
                // Log other types of errors and return a generic server error response
                console.error('Error processing request:', error);
                res.status(500).json({ error: 'Failed to send suggestion' });
            }
        }
    } else {
        // If the method is not POST, specify which methods are allowed
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
