import Link from 'next/link';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Unauthorized() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem]">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_500px_at_50%_200px,#C9EBFF,transparent)]" />
      </div>
      <Card className="w-[380px] px-5">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Access Denied</CardTitle>
          <CardDescription>
            You don&apos;t have permission to access this application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-gray-500 mb-4">
            If you believe this is an error, please contact the administrator.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/login">
            <Button variant="outline">Return to Login</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
