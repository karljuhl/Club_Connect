import React from "react";
import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Text,
    Tailwind,
    Section,
} from "@react-email/components";
import { Icons } from "@/components/icons";
import { siteConfig } from "@/config/site";

interface LoginEmailProps {
    name: string | null | undefined;
    url: string; 
}

const LoginEmail = ({ name, url }: LoginEmailProps) => {
    const previewText = `Login to ${siteConfig.name}!`;

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
                            Welcome Back to {siteConfig.name}!
                        </Heading>
                        <Text className="text-sm">Hello {name},</Text>
                        <Text className="text-sm">
                            Please click the button below to securely log in to your account at <span>{siteConfig.name}</span>.
                        </Text>
                        <Section className="text-center mt-[32px] mb-[32px]">
                            <Button
                                className="p-2 bg-[#00A3FF] rounded text-white text-xs font-semibold no-underline text-center"
                                href={url}
                            >
                                Log In
                            </Button>
                        </Section>
                        <Text className="text-sm">
                            If you did not request a login link, please ignore this email as your account is secure.
                        </Text>
                        <Text className="text-sm">
                            Cheers,
                            <br />
                            The {siteConfig.name} Team
                        </Text>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

export default LoginEmail;
