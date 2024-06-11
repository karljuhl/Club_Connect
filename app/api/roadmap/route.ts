// pages/api/roadmap.js
import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { sendFeatureEmail } from "@/lib/emails/send-feature";

const SuggestionSchema = z.object({
    suggestion: z.string().min(1, "Suggestion cannot be empty"),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    console.log('Request method:', req.method);  // Log the method of the request
    if (req.method === 'POST') {
        try {
            console.log('Received body:', req.body);
            const { suggestion } = SuggestionSchema.parse(req.body);
            console.log('Parsed suggestion:', suggestion);

            await sendFeatureEmail(suggestion);
            res.status(200).json({ message: 'Suggestion sent successfully' });
        } catch (error) {
            console.error('Error during request handling:', error);
            if (error instanceof z.ZodError) {
                res.status(400).json({ errors: error.errors });
            } else {
                res.status(500).json({ error: 'Failed to send suggestion' });
            }
        }
    } else {
        console.log('Non-POST request made');
        res.setHeader('Allow', ['POST']);
        res.status(405).end('Method Not Allowed');
    }
}
