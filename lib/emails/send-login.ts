import LoginEmail from "@/emails/LoginEmail";
import { siteConfig } from "@/config/site";
import { email as EmailClient } from "@/lib/email";


export async function sendLoginEmail({ name, email }: { name: string | null | undefined, email: string | null | undefined }) {
    const emailTemplate = LoginEmail({ name });
    try {
        // Send the email using the Resend API
        await EmailClient.emails.send({
            from: "Club Connect <no-reply@clubconnect.pro>",
            to: email as string,
            subject: `Login to ${siteConfig.name}!`,
            react: emailTemplate,
        });
    } catch (error) {
        // Log any errors and re-throw the error
        console.log({ error });
        //throw error;
    }
}