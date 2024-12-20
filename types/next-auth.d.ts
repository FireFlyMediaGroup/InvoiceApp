import 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    role?: 'USER' | 'SUPERVISOR' | 'ADMIN';
    isAllowed?: boolean;
  }

  interface Session {
    user?: User;
  }
}
