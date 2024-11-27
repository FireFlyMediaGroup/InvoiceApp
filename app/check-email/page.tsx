import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function CheckEmail() {
	return (
		<div className="flex h-screen w-full items-center justify-center px-4">
			<Card className="max-w-md">
				<CardHeader>
					<CardTitle className="text-2xl">Check Your Email</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="mb-4">
						We&apos;ve sent a login link to your email address. Please check
						your inbox and click on the link to log in.
					</p>
					<p className="mb-4">
						If you don&apos;t see the email, please check your spam folder.
					</p>
					<Link href="/login">
						<Button>Back to Login</Button>
					</Link>
				</CardContent>
			</Card>
		</div>
	);
}
