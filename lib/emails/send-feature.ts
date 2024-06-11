import { email as EmailClient } from "@/lib/email";

export async function sendFeatureEmail({ suggestion, name, email }: { suggestion: string, name: string | null | undefined, email: string | null | undefined }) {
    try {
        await EmailClient.emails.send({
            from: 'Club Connect <no-reply@clubconnect.pro>',
            to: 'features@clubconnect.pro',
            subject: 'New Feature Suggestion',
            text: `A new feature suggestion was submitted by ${name || 'an anonymous user'}: ${suggestion}`,
            html: `<p>A new feature suggestion was submitted by ${name ? `<strong>${name}</strong>` : 'an anonymous user'}:</p><p>${suggestion}</p>`
        });
    } catch (error) {
        console.log({ error });
        throw error; // You can handle this error depending on your error handling strategy
    }
}
