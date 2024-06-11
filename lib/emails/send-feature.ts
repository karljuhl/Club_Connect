import { email as EmailClient } from "@/lib/email";

export async function sendFeatureEmail({ name, email, suggestion }: { name: string | null | undefined, email: string | null | undefined, suggestion: string }) {
    try {
        // Send the email using the Email Client API
        await EmailClient.emails.send({
            from: 'Club Connect <no-reply@clubconnect.pro>',
            to: 'features@clubconnect.pro',
            subject: 'New Feature Suggestion',
            text: `A new feature suggestion was submitted by ${name || 'an anonymous user'}: ${suggestion}`,
            html: `<p>A new feature suggestion was submitted by ${name ? `<strong>${name}</strong>` : 'an anonymous user'}:</p><p>${suggestion}</p>`
        });
    } catch (error) {
        // Log any errors and re-throw the error
        console.log({ error });
        throw error; // Uncomment this if you want to propagate errors up the call stack
    }
}
