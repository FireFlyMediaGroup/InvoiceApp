'use client';

import { Button } from '../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  // Check if it's a login link error
  const isLoginLinkError = error.message.includes('login link');

  const handleReturnToLogin = () => {
    window.location.href = '/login';
  };

  return (
    <>
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem]">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_500px_at_50%_200px,#C9EBFF,transparent)]" />
      </div>
      <div className="flex h-screen w-full items-center justify-center px-4">
        <Card className="max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl">
              {isLoginLinkError
                ? 'Unable to Send Login Link'
                : 'An Error Occurred'}
            </CardTitle>
            <CardDescription>
              {isLoginLinkError
                ? "We're having trouble sending the login link. This might be due to temporary service issues."
                : 'Something went wrong while processing your request.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-y-4">
            <div className="text-sm text-red-500">{error.message}</div>
            <div className="flex flex-col gap-3">
              <Button onClick={reset} variant="default" className="w-full">
                Try Again
              </Button>
              <Button
                onClick={handleReturnToLogin}
                variant="outline"
                className="w-full"
              >
                Return to Login
              </Button>
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-gray-500">
              {isLoginLinkError
                ? 'If the problem persists, please try again in a few minutes or contact support.'
                : 'If this error continues, please contact your administrator for assistance.'}
            </p>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
