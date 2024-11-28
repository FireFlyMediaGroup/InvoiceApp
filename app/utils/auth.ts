import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import NodemailerProvider from "next-auth/providers/nodemailer";
import nodemailer from "nodemailer"; // Correct import for nodemailer
import prisma from "./db";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import type { User, Session } from "next-auth";

console.log("[NextAuth] Initializing auth configuration");

const customLogger = (message: string, error?: unknown): void => {
  console.log(`[NextAuth] ${message}`, error ? JSON.stringify(error, null, 2) : '');
};

// Extend the User type
interface ExtendedUser extends User {
  isAllowed?: boolean;
}

// Extend the Session type
interface ExtendedSession extends Session {
  user?: ExtendedUser;
}

// Custom Prisma Adapter to handle P2025 error
const customPrismaAdapter = {
  ...PrismaAdapter(prisma),
  deleteSession: async (sessionToken: string) => {
    try {
      await prisma.session.delete({
        where: { sessionToken },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
        // Session doesn't exist, log it but don't throw an error
        customLogger(`Attempted to delete non-existent session: ${sessionToken}`);
      } else {
        // For other errors, rethrow
        throw error;
      }
    }
  },
};

export const authConfig: NextAuthConfig = {
  adapter: customPrismaAdapter,
  providers: [
    NodemailerProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
      async sendVerificationRequest({ identifier, url, provider }) {
        // Check if the user is allowed before sending the magic link
        const dbUser = await prisma.user.findUnique({
          where: { email: identifier },
        });

        if (!dbUser || !dbUser.isAllowed) {
          customLogger(`Magic link not sent: User not authorized (${identifier})`);
          return; // Do not send the magic link
        }

        // Send the magic link for authorized users
        const { host } = new URL(url);
        const transport = nodemailer.createTransport(provider.server); // Use nodemailer here
        await transport.sendMail({
          to: identifier,
          from: provider.from,
          subject: `Sign in to ${host}`,
          text: `Sign in to ${host}\n\n${url}\n\n`,
          html: `<p>Sign in to <strong>${host}</strong></p><p><a href="${url}">Sign in</a></p>`,
        });
        customLogger(`Magic link sent to: ${identifier}`);
      },
    }),
  ],
  pages: {
    verifyRequest: "/verify",
    error: "/unauthorized",
  },
  callbacks: {
    async signIn({ user }): Promise<boolean> {
      customLogger(`Entering signIn callback for user: ${user.email}`);
      
      if (!user.email) {
        customLogger('Sign in failed: No email provided');
        return true; // Always return true to show the verify card
      }
      
      try {
        customLogger(`Attempting to find user in database: ${user.email}`);
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (!dbUser || !dbUser.isAllowed) {
          customLogger(`User not authorized: ${user.email}`);
          return true; // Always return true to show the verify card
        }

        customLogger(`User authorized: ${user.email}`);
        return true;
      } catch (error) {
        customLogger('Error during sign in:', error);
        return true; // Always return true to show the verify card
      }
    },
    async session({ session, user }): Promise<ExtendedSession> {
      customLogger(`Session callback called for user: ${user.id}`);
      const extendedSession = session as ExtendedSession;
      if (extendedSession.user) {
        extendedSession.user.id = user.id;
        // Add more user details to the session if needed
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { isAllowed: true }, // Add any other fields you want to include
        });
        if (dbUser) {
          extendedSession.user.isAllowed = dbUser.isAllowed;
        }
      }
      return extendedSession;
    },
  },
  events: {
    async signIn({ user }): Promise<void> {
      customLogger(`SignIn event triggered for user: ${user.id}`);
    },
    async session({ session, token }): Promise<void> {
      customLogger(`Session event triggered for user: ${session.user?.id}`, { sessionToken: token });
    },
  },
  logger: {
    error(error: Error) {
      customLogger(`Error: ${error.message}`, error);
    },
    warn(code: string) {
      customLogger(`Warning: ${code}`);
    },
    debug(code: string, metadata: unknown) {
      customLogger(`Debug: ${code}`, metadata);
    },
  },
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
};

console.log("[NextAuth] Auth configuration initialized, creating handlers");
export const { handlers, signIn, signOut, auth } = NextAuth(authConfig);
console.log("[NextAuth] Handlers created and exported");
