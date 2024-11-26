"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function Unauthorized() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  useEffect(() => {
    console.log(`[Unauthorized] User encountered unauthorized access. Error: ${error}`);
  }, [error]);

  let errorMessage = "Sorry, you are not authorized to access this application.";

  switch (error) {
    case 'UserNotFound':
      errorMessage = "User not found. Please check your email address and try again.";
      break;
    case 'UserNotAllowed':
      errorMessage = "Your account is not authorized to access this application. Please contact the administrator.";
      break;
    case 'Configuration':
      errorMessage = "There was a configuration error. Please contact the administrator.";
      break;
    case 'CredentialsSignin':
      errorMessage = "Sign in failed. Please check your credentials and try again.";
      break;
    case 'EmailSignin':
      errorMessage = "There was an error sending the email. Please try again later.";
      break;
    case 'SessionRequired':
      errorMessage = "Please sign in to access this page.";
      break;
    default:
      errorMessage = "An unexpected error occurred. Please try again or contact support.";
  }

  return (
    <div className="flex h-screen w-full items-center justify-center px-4">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Unauthorized Access</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">{errorMessage}</p>
          <Link href="/">
            <Button>Return to Home</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
