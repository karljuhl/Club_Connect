import React from "react";
import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Html,
    Img,
    Preview,
    Text,
    Tailwind,
    Section,
} from "@react-email/components";
import { Icons } from "@/components/icons"; // Import the Icons component
import { siteConfig } from "@/config/site";

interface WelcomeEmailProps {
    name: string | null | undefined;
}

export default function WelcomeEmail({ name }: WelcomeEmailProps) {
    const previewText = `Welcome to ${siteConfig.name}, ${name}!`;

    return (
        <Html>
            <Head />
            <Preview>{previewText}</Preview>
            <Tailwind>
                <Body className="bg-white my-auto mx-auto font-sans">
                    <Container className="my-10 mx-auto p-5 w-[465px]">
                        <Section className="flex justify-center items-center mb-4">
                            <div className="flex items-center justify-center">
                                <Icons.bell className="mr-6" />
                                <Text className="text-lg font-semibold">ClubConnect</Text>
                            </div>
                        </Section>
                        <Heading className="text-2xl font-normal text-center p-0 my-8 mx-0">
                            Welcome to {siteConfig.name}!
                        </Heading>
                        <Text className="text-sm">Hello {name},</Text>
                        <Text className="text-sm">
                            We&apos;re excited to have you onboard at <span>{siteConfig.name}</span>. We
                            hope you enjoy your journey with us. If you have any questions or
                            need assistance, feel free to reach out. You can contact us directly with the email support@clubconnect.pro
                        </Text>
                        <Section className="text-center mt-[32px] mb-[32px]">
                            <Button
                                className="p-2 bg-[#00A3FF] rounded text-white text-xs font-semibold no-underline text-center"
                                href={`${siteConfig.url}dashboard/onboarding`}
                            >
                                Get Started
                            </Button>
                        </Section>
                        <Text className="text-sm">
                            Cheers,
                            <br />
                            Your Team at {siteConfig.name}
                        </Text>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};
