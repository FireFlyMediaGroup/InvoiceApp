import { PrismaAdapter } from '@auth/prisma-adapter';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import NextAuth from 'next-auth';
import type { NextAuthConfig } from 'next-auth';
import type { Session, User } from 'next-auth';
import NodemailerProvider from 'next-auth/providers/nodemailer';
import nodemailer from 'nodemailer';
import prisma from './db';

// Custom logger function
const customLogger = (level: 'info' | 'warn' | 'error', message: string, error?: unknown): void => {
  if (process.env.NODE_ENV !== 'production') {
    const timestamp = new Date().toISOString();
    // eslint-disable-next-line no-console
    console[level](`[NextAuth ${timestamp}] ${message}`, error ? error : '');
  }
};

// Custom error class for email sending failures
class EmailSendError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EmailSendError';
  }
}

// Custom Prisma Adapter to handle P2025 error
let customPrismaAdapter: ReturnType<typeof PrismaAdapter>;
try {
  customPrismaAdapter = {
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
          customLogger('warn', `Attempted to delete non-existent session: ${sessionToken}`);
        } else {
          customLogger('error', 'Error in deleteSession:', error);
          throw error;
        }
      }
    },
  };
} catch (error) {
  customLogger('error', 'Error initializing PrismaAdapter:', error);
  throw error;
}

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
    customLogger('error', `Missing required email configuration: ${missingVars.join(', ')}`);
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
        secure: process.env.EMAIL_SERVER_PORT === '465',
      },
      from: process.env.EMAIL_FROM,
      async sendVerificationRequest({ identifier, url, provider }) {
        customLogger('info', `Attempting to send verification request to: ${identifier}`);
        if (!validateEmailConfig()) {
          customLogger('error', 'Email configuration validation failed');
          throw new Error(
            'System configuration error. Please contact support.'
          );
        }

        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: identifier },
          });

          if (!dbUser || !dbUser.isAllowed) {
            customLogger('warn', `Magic link not sent: User not authorized (${identifier})`);
            return; // Do not send the magic link
          }

          const { host } = new URL(url);
          const transport = nodemailer.createTransport(provider.server);
          
          const brandColor = "#007bff";
          const backgroundColor = "#f4f4f5";
          const textColor = "#111827";
          const buttonBackgroundColor = brandColor;
          const buttonTextColor = "#ffffff";
          const logoUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/SkySpecs_Logo_Stacked_vertical.png`;

          await transport.sendMail({
            to: identifier,
            from: provider.from,
            subject: `Sign in to ${host}`,
            text: `Sign in to ${host}\n\n${url}\n\n`,
            html: `
  <!DOCTYPE html>
  <html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
  <head>
    <meta charset="utf-8">
    <meta name="x-apple-disable-message-reformatting">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
    <title>Sign in to ${host}</title>
    <!--[if mso]>
    <xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml>
    <style>
      td,th,div,p,a,h1,h2,h3,h4,h5,h6 {font-family: "Segoe UI", sans-serif; mso-line-height-rule: exactly;}
    </style>
    <![endif]-->
    <style>
      @media screen {
        @font-face {
          font-family: 'Inter';
          font-style: normal;
          font-weight: 400;
          src: url('https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2') format('woff2');
        }
        @font-face {
          font-family: 'Inter';
          font-style: normal;
          font-weight: 600;
          src: url('https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiA.woff2') format('woff2');
        }
      }

      .hover-scale {
        transition: transform 0.15s ease-in-out;
      }
      .hover-scale:hover {
        transform: scale(1.02);
      }

      @media (prefers-color-scheme: dark) {
        .dark-mode-bg { background-color: ${backgroundColor} !important; }
        .dark-mode-text { color: ${textColor} !important; }
      }
    </style>
  </head>
  <body class="dark-mode-bg" style="margin: 0; padding: 0; width: 100%; word-break: break-word; -webkit-font-smoothing: antialiased; background-color: #f4f4f5;">
    <div role="article" aria-roledescription="email" aria-label="Sign in to ${host}" lang="en" style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <table style="width: 100%;" cellpadding="0" cellspacing="0" role="presentation">
        <tr>
          <td align="center" style="padding: 24px;">
            <table style="width: 100%; max-width: 600px;" cellpadding="0" cellspacing="0" role="presentation">
              <!-- Logo Section -->
              <tr>
                <td align="center" style="padding-bottom: 24px;">
                  <img src="${logoUrl}" alt="Logo" style="border: 0; height: 40px; width: auto;">
                  <h3 style="margin-top: 10px; font-size: 24px; font-weight: 600; line-height: normal;">
                    Safety<span style="color: #007bff;">Docs</span>
                  </h3>
                </td>
              </tr>
              <!-- Main Content -->
              <tr>
                <td style="padding: 32px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);" class="dark-mode-bg">
                  <h1 style="margin-top: 0; margin-bottom: 16px; color: #111827; font-size: 24px; font-weight: 600; text-align: center;" class="dark-mode-text">
                    Sign in to ${host}
                  </h1>
                  <p style="margin: 0; margin-bottom: 24px; text-align: center; font-size: 16px; line-height: 24px; color: #4b5563;" class="dark-mode-text">
                    Click the button below to securely sign in to your account. This link will expire in 24 hours.
                  </p>
                  <table cellpadding="0" cellspacing="0" role="presentation" style="margin: 0 auto;">
                    <tr>
                      <td style="mso-padding-alt: 16px 24px; background-color: ${buttonBackgroundColor}; border-radius: 6px;" class="hover-scale">
                        <a href="${url}" 
                           style="display: inline-block; padding: 16px 32px; font-size: 16px; font-weight: 600; line-height: 1; color: ${buttonTextColor}; text-decoration: none;">
                          Sign in securely
                        </a>
                      </td>
                    </tr>
                  </table>
                  <!-- Security Notice -->
                  <table style="width: 100%; margin-top: 32px;" cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                      <td style="padding: 16px; background-color: #f3f4f6; border-radius: 6px;" class="dark-mode-bg">
                        <p style="margin: 0; text-align: center; font-size: 14px; line-height: 20px; color: #6b7280;" class="dark-mode-text">
                          If you didn't request this email, you can safely ignore it. For security, this link can only be used once.
                        </p>
                      </td>
                    </tr>
                  </table>
                  <!-- Footer -->
                  <p style="margin-top: 32px; margin-bottom: 0; text-align: center; font-size: 12px; line-height: 16px; color: #9ca3af;" class="dark-mode-text">
                    © ${new Date().getFullYear()} ${host}. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  </body>
  </html>`,
          });
          customLogger('info', `Magic link sent to: ${identifier}`);
        } catch (error) {
          customLogger('error', 'Error in sendVerificationRequest:', error);
          throw new EmailSendError(
            `Failed to send verification email: ${error instanceof Error ? error.message : 'Unknown error'}`
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
      customLogger('info', `Entering signIn callback for user: ${user.email}`);

      if (!user.email) {
        customLogger('warn', 'Sign in failed: No email provided');
        return false;
      }

      try {
        customLogger('info', `Attempting to find user in database: ${user.email}`);
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
          select: { id: true, isAllowed: true, role: true },
        });

        if (!dbUser || !dbUser.isAllowed) {
          customLogger('warn', `User not authorized: ${user.email}`);
          return false;
        }

        // End all existing sessions for the user
        await prisma.session.deleteMany({
          where: { userId: dbUser.id },
        });
        customLogger('info', `Ended all existing sessions for user: ${dbUser.id}`);

        customLogger('info', `User authorized: ${user.email}, Role: ${dbUser.role}`);
        return true;
      } catch (error) {
        customLogger('error', 'Error during sign in:', error);
        return false;
      }
    },
    async session({ session, user }): Promise<Session> {
      customLogger('info', `Session callback called for user: ${user.id}`);
      if (session.user) {
        session.user.id = user.id;
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { isAllowed: true, role: true },
        });
        if (dbUser) {
          session.user.isAllowed = dbUser.isAllowed;
          session.user.role = dbUser.role;
        }
      }
      return session;
    },
    async authorized({ request, auth }) {
      const { pathname } = request.nextUrl;
      const user = auth?.user as User;

      // Define role-based access rules
      const roleAccessRules = {
        '/admin': ['ADMIN'],
        '/supervisor': ['ADMIN', 'SUPERVISOR'],
        '/user': ['ADMIN', 'SUPERVISOR', 'USER'],
      };

      // Check if the pathname requires specific role access
      for (const [path, allowedRoles] of Object.entries(roleAccessRules)) {
        if (pathname.startsWith(path)) {
          if (!user?.role || !allowedRoles.includes(user.role)) {
            customLogger('warn', `Access denied for user ${user?.id} to ${pathname}`);
            return false;
          }
          break;
        }
      }

      // If no specific role check is needed, ensure the user is at least authenticated
      if (!user) {
        customLogger('warn', `Unauthenticated access attempt to ${pathname}`);
        return false;
      }

      customLogger('info', `Access granted for user ${user.id} to ${pathname}`);
      return true;
    },
  },
  events: {
    async signIn({ user }): Promise<void> {
      customLogger('info', `SignIn event triggered for user: ${user.id}`);
    },
    async session({ session }): Promise<void> {
      customLogger('info', `Session event triggered for user: ${session.user?.id}`);
    },
  },
  logger: {
    error(error: Error) {
      customLogger('error', `Error: ${error.message}`, error);
    },
    warn(code: string) {
      customLogger('warn', `Warning: ${code}`);
    },
    debug(code: string, metadata: unknown) {
      customLogger('info', `Debug: ${code}`, metadata);
    },
  },
  session: {
    strategy: 'database',
    maxAge: 24 * 60 * 60, // 24 hours (1 day)
    updateAge: 60 * 60, // 1 hour
  },
  secret: process.env.NEXTAUTH_SECRET, // Add this line to include the secret
};

customLogger('info', 'Auth configuration initialized, creating handlers');
export const { handlers, signIn, signOut, auth } = NextAuth(authConfig);
customLogger('info', 'Handlers created and exported');
