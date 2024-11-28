import { MailtrapClient } from 'mailtrap';

if (!process.env.MAILTRAP_TOKEN) {
  throw new Error('MAILTRAP_TOKEN environment variable is not set');
}

export const emailClient = new MailtrapClient({
  token: process.env.MAILTRAP_TOKEN,
});
