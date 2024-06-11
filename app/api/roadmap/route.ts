// pages/api/roadmap.js
import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { sendFeatureEmail } from "@/lib/emails/send-feature";

const SuggestionSchema = z.object({
    suggestion: z.string().min(1, "Suggestion cannot be empty"),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            const { suggestion } = SuggestionSchema.parse(req.body);

            // Send the email with the suggestion
            await sendFeatureEmail(suggestion);
            res.status(200).json({ message: 'Suggestion sent successfully' });
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({ errors: error.errors });
            } else {
                console.error('Error sending email:', error);
                res.status(500).json({ error: 'Failed to send suggestion' });
            }
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end('Method Not Allowed');
    }
}
