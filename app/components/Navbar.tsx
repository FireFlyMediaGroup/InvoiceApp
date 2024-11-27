import { buttonVariants } from "@/components/ui/button";
import { RainbowButton } from "@/components/ui/rainbow-button";
import Logo from "@/public/SkySpecs_Logo_Stacked_vertical.png";
import Image from "next/image";
import Link from "next/link";

export function Navbar() {
	return (
		<div className="flex items-center justify-between py-5 relative z-50">
			<Link href="/" className="flex items-center gap-2">
				<Image src={Logo} alt="Logo" className="size-10" />
				<h3 className="text-3xl font-semibold leading-normal py-1">
					Safety<span className="text-blue-500">Docs</span>
				</h3>
			</Link>
			<Link href="/login" className="w-fit relative z-10">
				<RainbowButton className="w-full">Get Started</RainbowButton>
			</Link>
		</div>
	);
}
