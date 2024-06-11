// api/roadmap.ts
import { sendFeatureEmail } from "@/lib/emails/send-feature";

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const { suggestion } = req.body;
            await sendFeatureEmail(suggestion);
            res.status(200).json({ message: 'Suggestion sent successfully' });
        } catch (error) {
            res.status(500).json({ error: 'Failed to send suggestion' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
