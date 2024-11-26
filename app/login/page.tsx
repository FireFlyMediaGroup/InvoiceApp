import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth, signIn } from "../utils/auth";
import { SubmitButton } from "../components/SubmitButtons";
import { redirect } from "next/navigation";

export default async function Login() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  async function handleLogin(formData: FormData) {
    "use server";
    
    const email = formData.get("email") as string;
    console.log(`[Login] Attempting login for email: ${email}`);

    try {
      await signIn("nodemailer", formData);
      console.log(`[Login] Login link sent successfully for email: ${email}`);
      // Redirect to a page informing the user to check their email
      redirect("/check-email");
    } catch (error: unknown) {
      if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
        console.log(`[Login] Redirecting after successful login for email: ${email}`);
        // Allow the redirect to happen
        throw error;
      }
      
      console.error(`[Login] Error during login for email: ${email}`, error);
      // Here you might want to set some state to show an error message to the user
      // For now, we'll just throw a new error
      throw new Error("Login failed. Please try again.");
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
            <form
              action={handleLogin}
              className="flex flex-col gap-y-4"
            >
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
              After submitting, you&apos;ll receive an email with a link to log in. 
              Please check your inbox and spam folder.
            </p>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
