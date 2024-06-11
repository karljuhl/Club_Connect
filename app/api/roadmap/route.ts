import nodemailer from 'nodemailer';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { suggestion } = req.body;

        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_SERVER_HOST,
            port: parseInt(process.env.EMAIL_SERVER_PORT, 10),
            secure: true,
            auth: {
                user: process.env.EMAIL_SERVER_USER,
                pass: process.env.EMAIL_SERVER_PASSWORD
            }
        });

        try {
            await transporter.sendMail({
                from: 'Club Connect <no-reply@clubconnect.pro>',
                to: 'features@clubconnect.pro',
                subject: 'New Feature Suggestion',
                text: `A new feature suggestion was submitted: ${suggestion}`,
                html: `<p>A new feature suggestion was submitted:</p><p>${suggestion}</p>`
            });

            res.status(200).send('Suggestion sent successfully');
        } catch (error) {
            console.error('Error sending email:', error);
            res.status(500).send('Error sending suggestion');
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
