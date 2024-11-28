import { RainbowButton } from '../../components/ui/rainbow-button';
import Image from 'next/image';
import Link from 'next/link';

export function Hero() {
  return (
    <section className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Full-screen background image */}
      <div className="absolute inset-0">
        <Image
          src="/wallpaper01.png"
          alt="Background"
          fill
          style={{ objectFit: 'cover', objectPosition: 'center' }}
          quality={100}
          priority
        />
      </div>

      {/* Overlay for reducing opacity */}
      <div className="absolute inset-0 bg-white opacity-65" />

      {/* Content */}
      <div className="relative z-20 text-center w-full max-w-4xl mx-auto px-4">
        <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tighter">
          <span className="block bg-gradient-to-l from-blue-500 via-teal-500 to-green-500 text-transparent bg-clip-text leading-normal">
            Manage your mission planning
            <br />
            and safety documents here.
          </span>
        </h1>
      </div>

      <div className="relative z-20 mt-6">
        <Link href="/login">
          <RainbowButton>Let&apos;s GO!</RainbowButton>
        </Link>
      </div>

      {/* Decorative SVG */}
      <svg
        className="absolute inset-0 blur-3xl opacity-30"
        style={{ zIndex: 10 }}
        fill="none"
        viewBox="0 0 400 400"
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        aria-labelledby="decorativeBackgroundTitle"
        role="presentation"
      >
        <title id="decorativeBackgroundTitle">
          Decorative background gradient
        </title>
        <g clipPath="url(#clip0_10_20)">
          <g filter="url(#filter0_f_10_20)">
            <path d="M128.6 0H0V322.2L106.2 134.75L128.6 0Z" fill="#03FFE0" />
            <path
              d="M0 322.2V400H240H320L106.2 134.75L0 322.2Z"
              fill="#7C87F8"
            />
            <path
              d="M320 400H400V78.75L106.2 134.75L320 400Z"
              fill="#4C65E4"
            />
            <path d="M400 0H128.6L106.2 134.75L400 78.75V0Z" fill="#043AFF" />
          </g>
        </g>
        <defs>
          <filter
            colorInterpolationFilters="sRGB"
            filterUnits="userSpaceOnUse"
            height="720.666"
            id="filter0_f_10_20"
            width="720.666"
            x="-160.333"
            y="-160.333"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend
              in="SourceGraphic"
              in2="BackgroundImageFix"
              mode="normal"
              result="shape"
            />
            <feGaussianBlur
              result="effect1_foregroundBlur_20_20"
              stdDeviation="80.1666"
            />
          </filter>
        </defs>
      </svg>
    </section>
  );
}
