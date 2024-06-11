// pages/api/roadmap.js
import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { sendFeatureEmail } from "@/lib/emails/send-feature";

const SuggestionSchema = z.object({
    suggestion: z.string().min(1, "Suggestion cannot be empty"),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end('Method Not Allowed');
    }

    try {
        const { suggestion } = SuggestionSchema.parse(req.body);
        console.log('Parsed suggestion:', suggestion);

        await sendFeatureEmail(suggestion);
        return res.status(200).json({ message: 'Suggestion sent successfully' });
    } catch (error) {
        console.error('Error during request handling:', error);
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        } else {
            return res.status(500).json({ error: 'Failed to send suggestion' });
        }
    }
}
