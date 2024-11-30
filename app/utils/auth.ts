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
export interface ExtendedUser extends User {
  isAllowed?: boolean;
  role?: 'USER' | 'SUPERVISOR' | 'ADMIN';
}

// Extend the Session type
export interface ExtendedSession extends Session {
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
          select: { isAllowed: true, role: true },
        });

        if (!dbUser || !dbUser.isAllowed) {
          customLogger(`User not authorized: ${user.email}`);
          return true; // Always return true to show the verify card
        }

        customLogger(`User authorized: ${user.email}, Role: ${dbUser.role}`);
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
          select: { isAllowed: true, role: true },
        });
        if (dbUser) {
          extendedSession.user.isAllowed = dbUser.isAllowed;
          extendedSession.user.role = dbUser.role;
        }
      }
      return extendedSession;
    },
    async authorized({ request, auth }) {
      const { pathname } = request.nextUrl;
      const user = auth?.user as ExtendedUser;

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
            customLogger(`Access denied for user ${user?.id} to ${pathname}`);
            return false;
          }
          break;
        }
      }

      // If no specific role check is needed, ensure the user is at least authenticated
      if (!user) {
        customLogger(`Unauthenticated access attempt to ${pathname}`);
        return false;
      }

      customLogger(`Access granted for user ${user.id} to ${pathname}`);
      return true;
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


