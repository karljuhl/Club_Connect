// api/roadmap.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';  // Zod for validation
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

            // Send the email with the suggestion
            await sendFeatureEmail(suggestion);

            // Respond with success if email is sent
            res.status(200).json({ message: 'Suggestion sent successfully' });
        } catch (error) {
            if (error instanceof z.ZodError) {
                // Return a 400 status code with the error details
                res.status(400).json({ errors: error.errors });
            } else {
                // Return a 500 status code for internal server errors
                res.status(500).json({ error: 'Failed to send suggestion' });
            }
        }
    } else {
        // If the method is not POST, specify which methods are allowed
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
