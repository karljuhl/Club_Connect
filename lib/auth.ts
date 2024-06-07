import { type NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import GithubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import nodemailer from "nodemailer";

import { db } from "@/lib/db"
import { sendWelcomeEmail } from "./emails/send-welcome";
import { sendLoginEmail } from "./emails/send-login";

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
      from: "Club Connect <no-reply@clubconnect.pro>",
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
          from: "Club Connect <no-reply@clubconnect.pro>",
          subject: 'Sign in to ClubConnect',
          text: `Sign in with magic link: ${url}`,
          html: `
          <!DOCTYPE html>
          <html>
          <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 20px;
            }
            .container {
              background-color: #fff;
              width: 100%;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            }
            .header {
              background-color: #ffffff;
              color: #000000;
              padding: 10px 20px;
              text-align: center;
              border-top-left-radius: 8px;
              border-top-right-radius: 8px;
              border: 2px solid #000000;
            }
            .content {
              padding: 20px;
              text-align: center;
            }
            .button {
              display: inline-block;
              padding: 10px 20px;
              margin: 20px 0;
              background-color: #ffffff;
              color: #000000;
              text-decoration: none;
              border-radius: 5px;
              border: 2px solid #000000;
              transition: background-color 0.3s, color 0.3s;
            }
            .button:hover {
              background-color: #000000;
              color: #ffffff;
            }
            .footer {
              font-size: 12px;
              color: #666;
              text-align: center;
              padding: 20px;
            }
          </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-concierge-bell">
                    <path d="M3 20a1 1 0 0 1-1-1v-1a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v1a1 1 0 0 1-1 1Z"/>
                    <path d="M20 16a8 8 0 1 0-16 0"/>
                    <path d="M12 4v4"/>
                    <path d="M10 4h4"/>
                  </svg>
                ClubConnect Sign-In 
              </div>
              <div class="content">
                <p>Please click the button below to verify your email address and sign in to your account.</p>
                <a href="${url}" class="button">Verify Email</a>
                <br>
                <p>Any time you need to log in to your account you can use the magic link and input the same email used previously then we send you a link which will log you in, like magic.</p>
              </div>
              <div class="footer">
                &copy; 2024 ClubConnect, Inc. All rights reserved.
              </div>
            </div>
          </body>
          </html>
                `,
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

