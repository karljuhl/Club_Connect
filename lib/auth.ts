import { type NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import GithubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import nodemailer from "nodemailer";

import { db } from "@/lib/db"
import { sendWelcomeEmail } from "./emails/send-welcome";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db as any),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      allowDangerousEmailAccountLinking: true,
    }),
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: parseInt(process.env.EMAIL_SERVER_PORT, 10),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
        secure: true, // Required for port 465, optional for other ports
      },
      from: "no-reply@clubconnect.pro",
      sendVerificationRequest: ({ identifier, url }) => {
        const transport = nodemailer.createTransport({
          host: process.env.EMAIL_SERVER_HOST,
          port: parseInt(process.env.EMAIL_SERVER_PORT, 10),
          auth: {
            user: process.env.EMAIL_SERVER_USER,
            pass: process.env.EMAIL_SERVER_PASSWORD,
          },
          secure: true, // Required for port 465, optional for other ports
        });
        return transport.sendMail({
          to: identifier,
          from: "no-reply@clubconnect.pro",
          subject: 'Sign in to ClubConnect',
          text: `Sign in by clicking on this link: ${url}`,
          html: `<p>Sign in by clicking <a href="${url}">here</a>.</p>`,
        });
      }
    })
  ],
  callbacks: {
    async session({ token, session }) {
      if (token) {
        session!.user!.id = token.id
        session!.user!.name = token.name
        session!.user!.email = token.email
        session!.user!.image = token.picture
      }

      return session
    },
    async jwt({ token, user }) {
      const dbUser = await db.user.findFirst({
        where: {
          email: token.email,
        },
      })

      if (!dbUser) {
        if (user) {
          token.id = user?.id
        }
        return token
      }

      return {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        picture: dbUser.image,
      }
    },
  },
  events: {
    async createUser(message) {
      // Prepare the welcome email parameters
      const params = {
        name: message.user.name,
        email: message.user.email,
      };

      // Send the welcome email
      await sendWelcomeEmail(params);

      // Set the default OpenAI API key for the new user
      try {
        const apiKey = process.env.DEFAULT_CONFIG_API_KEY; // Ensure this environment variable is correctly set

        // Insert the OpenAI configuration for the new user
        await db.openAIConfig.create({
          data: {
            userId: message.user.id,  // Assuming 'id' is available and correct
            globalAPIKey: apiKey,
          },
        });

        console.log("OpenAI API Key set successfully for user:", message.user.id);
      } catch (error) {
        console.error("Error setting OpenAI API Key during user creation:", error);
        // Handle the error appropriately, maybe log it or send an alert
      }
    }
  },

};

