import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Nodemailer from "next-auth/providers/nodemailer";
import prisma from "./db";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import type { User, Session } from "next-auth";

console.log("[NextAuth] Initializing auth configuration");

const customLogger = (message: string, error?: unknown): void => {
  const timestamp = new Date().toISOString();
  console.log(`[NextAuth ${timestamp}] ${message}`, error ? JSON.stringify(error, null, 2) : '');
};

// Extend the User type
interface ExtendedUser extends User {
  isAllowed?: boolean;
}

// Extend the Session type
interface ExtendedSession extends Session {
  user?: ExtendedUser;
}

// Custom error class for email sending failures
class EmailSendError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EmailSendError';
  }
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
        customLogger(`Attempted to delete non-existent session: ${sessionToken}`);
      } else {
        throw error;
      }
    }
  },
};

// Validate email configuration
const validateEmailConfig = () => {
  const requiredEnvVars = [
    'EMAIL_SERVER_HOST',
    'EMAIL_SERVER_PORT',
    'EMAIL_SERVER_USER',
    'EMAIL_SERVER_PASSWORD',
    'EMAIL_FROM'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    customLogger(`Missing required email configuration: ${missingVars.join(', ')}`);
    return false;
  }
  return true;
};

export const authConfig: NextAuthConfig = {
  adapter: customPrismaAdapter,
  providers: [
    Nodemailer({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
        // Set connection timeout in transport options
        connectionTimeout: 10000,
        socketTimeout: 10000,
      },
      from: process.env.EMAIL_FROM,
    }),
  ],
  pages: {
    verifyRequest: "/verify",
    signIn: "/login",
    error: "/verify", // Changed to always show verify page
  },
  callbacks: {
    async signIn({ user }): Promise<boolean> {
      customLogger(`Entering signIn callback for user: ${user.email}`);
      
      if (!user.email) {
        customLogger('Sign in failed: No email provided');
        return false;
      }
      
      try {
        if (!validateEmailConfig()) {
          customLogger('Email configuration validation failed');
          throw new Error("System configuration error. Please contact support.");
        }

        customLogger(`Attempting to find user in database: ${user.email}`);
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        // For security, we'll show the same verify page regardless of user status
        if (!dbUser || !dbUser.isAllowed) {
          customLogger(`User verification failed: ${user.email}`);
          // Instead of throwing an error, redirect to verify page
          return true;
        }

        customLogger(`Sign in successful for user: ${user.email}`);
        return true;
      } catch (error) {
        customLogger('Error during sign in:', error);
        
        if (error instanceof Error) {
          if (error.message.includes('ETIMEDOUT')) {
            throw new Error("Email service timed out. Please try again later.");
          }
          if (error.message.includes('ECONNREFUSED')) {
            throw new Error("Unable to connect to email service. Please try again later.");
          }
        }
        
        // For any error, show the verify page
        return true;
      }
    },
    async session({ session, user }): Promise<ExtendedSession> {
      customLogger(`Session callback called for user: ${user.id}`);
      const extendedSession = session as ExtendedSession;
      if (extendedSession.user) {
        extendedSession.user.id = user.id;
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { isAllowed: true },
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
