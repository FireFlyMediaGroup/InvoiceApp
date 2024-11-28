import { RainbowButton } from '../../components/ui/rainbow-button';
import Logo from '../../public/SkySpecs_Logo_Stacked_vertical.png';
import Image from 'next/image';
import Link from 'next/link';

export function Navbar() {
  return (
    <nav className="w-full bg-white bg-opacity-80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3">
            <Image src={Logo} alt="Logo" className="h-10 w-auto" />
            <h3 className="text-2xl font-semibold leading-normal">
              Safety<span className="text-blue-500">Docs</span>
            </h3>
          </Link>
          <div>
            <Link href="/login">
              <RainbowButton className="px-6 py-2">Get Started</RainbowButton>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
