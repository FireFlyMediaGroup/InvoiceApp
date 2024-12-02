import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { redirect } from 'next/navigation';
import { SubmitButton } from '../components/SubmitButtons';
import { auth, signIn } from '../utils/auth';

export default async function Login() {
  const session = await auth();

  if (session?.user) {
    redirect('/dashboard');
  }

  async function handleLogin(formData: FormData) {
    'use server';

    const email = formData.get('email') as string;

    try {
      await signIn('nodemailer', formData);
      redirect('/check-email');
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message.includes('NEXT_REDIRECT')) {
          throw error;
        }

        if (error.message.includes('User not found')) {
          throw new Error(
            'Account not found. Please contact your administrator.'
          );
        }
        if (error.message.includes('not allowed')) {
          throw new Error(
            'Your account is not activated. Please contact your administrator.'
          );
        }
      }

      throw new Error('Unable to send login link. Please try again later.');
    }
  }

  return (
    <>
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem]">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_500px_at_50%_200px,#C9EBFF,transparent)]" />
      </div>
      <div className="flex h-screen w-full items-center justify-center px-4">
        <Card className="max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>
              Enter your email below to receive a login link
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handleLogin} className="flex flex-col gap-y-4">
              <div className="flex flex-col gap-y-2">
                <Label>Email</Label>
                <Input
                  name="email"
                  type="email"
                  required
                  placeholder="hello@hello.com"
                />
              </div>
              <SubmitButton text="Send Login Link" />
            </form>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-gray-500">
              After submitting, you&apos;ll receive an email with a link to log
              in. Please check your inbox and spam folder.
            </p>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
