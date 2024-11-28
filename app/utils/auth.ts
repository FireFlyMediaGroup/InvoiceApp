import { PrismaAdapter } from '@auth/prisma-adapter';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import NextAuth from 'next-auth';
import type { NextAuthConfig } from 'next-auth';
import type { Session, User } from 'next-auth';
import NodemailerProvider from 'next-auth/providers/nodemailer';
import nodemailer from 'nodemailer';
import prisma from './db';

console.log('[NextAuth] Initializing auth configuration');

const customLogger = (message: string, error?: unknown): void => {
  const timestamp = new Date().toISOString();
  console.log(
    `[NextAuth ${timestamp}] ${message}`,
    error ? JSON.stringify(error, null, 2) : ''
  );
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
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        customLogger(
          `Attempted to delete non-existent session: ${sessionToken}`
        );
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
    'EMAIL_FROM',
  ];

  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    customLogger(
      `Missing required email configuration: ${missingVars.join(', ')}`
    );
    return false;
  }
  return true;
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
        connectionTimeout: 10000,
        socketTimeout: 10000,
      },
      from: process.env.EMAIL_FROM,
      async sendVerificationRequest({ identifier, url, provider }) {
        if (!validateEmailConfig()) {
          customLogger('Email configuration validation failed');
          throw new Error(
            'System configuration error. Please contact support.'
          );
        }

        const dbUser = await prisma.user.findUnique({
          where: { email: identifier },
        });

        if (!dbUser || !dbUser.isAllowed) {
          customLogger(
            `Magic link not sent: User not authorized (${identifier})`
          );
          return; // Do not send the magic link
        }

        const { host } = new URL(url);
        const transport = nodemailer.createTransport(provider.server);
        try {
          await transport.sendMail({
            to: identifier,
            from: provider.from,
            subject: `Sign in to ${host}`,
            text: `Sign in to ${host}\n\n${url}\n\n`,
            html: `<p>Sign in to <strong>${host}</strong></p><p><a href="${url}">Sign in</a></p>`,
          });
          customLogger(`Magic link sent to: ${identifier}`);
        } catch (error) {
          customLogger('Error sending email:', error);
          throw new EmailSendError(
            'Failed to send verification email. Please try again later.'
          );
        }
      },
    }),
  ],
  pages: {
    verifyRequest: '/verify',
    signIn: '/login',
    error: '/verify',
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
      customLogger(`Session event triggered for user: ${session.user?.id}`, {
        sessionToken: token,
      });
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
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
};

console.log('[NextAuth] Auth configuration initialized, creating handlers');
export const { handlers, signIn, signOut, auth } = NextAuth(authConfig);
console.log('[NextAuth] Handlers created and exported');
