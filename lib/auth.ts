import { type NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import AzureADProvider from "next-auth/providers/azure-ad";

import { db } from "@/lib/db";
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
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
      tenantId: process.env.AZURE_AD_TENANT_ID,
      authorization: { params: { scope: 'openid email profile User.Read' } },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile, email }) {
      // Check if the user already exists with a different provider
      const existingUser = await db.user.findUnique({
        where: { email: user.email },
      });

      if (existingUser && existingUser.provider !== account.provider) {
        // Link the new account to the existing user if email addresses match
        await db.user.update({
          where: { email: user.email },
          data: {
            provider: account.provider,
            providerAccountId: account.providerAccountId,
          },
        });
        return true;  // Sign-in successful, user linked
      }

      return true;  // Normal sign-in, no linking required
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.name = token.name;
      session.user.email = token.email;
      session.user.image = token.picture;
      return session;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
  },
  events: {
    async createUser(message) {
      const params = {
        name: message.user.name,
        email: message.user.email,
      };

      await sendWelcomeEmail(params);

      try {
        const apiKey = process.env.DEFAULT_CONFIG_API_KEY;
        await db.openAIConfig.create({
          data: {
            userId: message.user.id,
            globalAPIKey: apiKey,
          },
        });

        console.log("OpenAI API Key set successfully for user:", message.user.id);
      } catch (error) {
        console.error("Error setting OpenAI API Key during user creation:", error);
      }
    }
  },
};
