import { email as EmailClient } from "@/lib/email";

export async function sendFeatureEmail({ name, email }: { name: string | null | undefined, email: string | null | undefined }) {
    try {
        // Send the email using the Resend API
        await EmailClient.emails.send({
            from: 'Club Connect <no-reply@clubconnect.pro>',
            to: 'features@clubconnect.pro',
            subject: 'New Feature Suggestion',
            text: `A new feature suggestion was submitted: ${suggestion}`,
            html: `<p>A new feature suggestion was submitted:</p><p>${suggestion}</p>`
        });
    } catch (error) {
        // Log any errors and re-throw the error
        console.log({ error });
        //throw error;
    }
}