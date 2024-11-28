import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-[400px] p-6">
        <div className="space-y-4 text-center">
          <h1 className="text-2xl font-bold">Unauthorized Access</h1>
          <p className="text-gray-600">
            You do not have permission to access this page. Please log in with
            appropriate credentials.
          </p>
          <div className="pt-4">
            <Link href="/login">
              <Button variant="default" className="w-full">
                Go to Login
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
