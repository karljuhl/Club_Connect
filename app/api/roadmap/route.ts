// api/roadmap.ts
import { sendFeatureEmail } from "@/lib/emails/send-feature";

export default async function handler(req, res) {
    console.log('Received request:', req.method);

    if (req.method === 'POST') {
        try {
            const { suggestion } = req.body;
            console.log('Processing suggestion:', suggestion);
            await sendFeatureEmail(suggestion);
            res.status(200).json({ message: 'Suggestion sent successfully' });
        } catch (error) {
            console.error('Error processing request:', error);
            res.status(500).json({ error: 'Failed to send suggestion' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
