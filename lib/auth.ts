import { type NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import GithubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google";
import AzureADProvider from "next-auth/providers/azure-ad";

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
        AzureADProvider({
          clientId: process.env.AZURE_AD_CLIENT_ID,
          clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
          tenantId: process.env.AZURE_AD_TENANT_ID,
          authorization: { params: { scope: 'openid email profile User.Read' } },
        })
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      // If account and user are defined, it's an initial login
      if (account && user) {
        token.accessToken = account.access_token;
        token.tokenType = account.token_type;
        token.expiresIn = account.expires_in;
        token.extExpiresIn = account.ext_expires_in;
  
        // Find or create the user in your database and add the database user ID to the token
        const dbUser = await db.user.upsert({
          where: { email: user.email },
          update: {},
          create: {
            email: user.email,
            name: user.name,
          },
        });
  
        token.id = dbUser.id;  // Save user ID from the database into the token
      }
  
      return token;
    },
  
    async session({ session, token }) {
      // Pass custom claims to the session
      session.user.id = token.id;  // Ensure the user's ID is passed to the session
      session.accessToken = token.accessToken;
      session.tokenType = token.tokenType;
      session.expiresIn = token.expiresIn;
      session.extExpiresIn = token.extExpiresIn;
  
      return session;
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

