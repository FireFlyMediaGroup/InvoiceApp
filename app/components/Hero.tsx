import { RainbowButton } from "@/components/ui/rainbow-button";
import Image from "next/image";
import Link from "next/link";
import HeroImage from "@/public/wallpaper01.png";

export function Hero() {
  return (
    <section className="relative flex flex-col items-center justify-start py-4 lg:py-6 -mt-12">
      <div className="text-center">
        <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tighter mt-8">
          <span className="block mt-0 bg-gradient-to-l from-blue-500 via-teal-500 to-green-500 text-transparent bg-clip-text leading-normal">
            Manage your mission planning
            <br />
            and safety documents here.
          </span>
        </h1>
      </div>

      <div className="relative items-center w-full py-2 mx-auto mt-4">
        <svg
          className="absolute inset-0 -mt-8 blur-3xl"
          style={{ zIndex: -1 }}
          fill="none"
          viewBox="0 0 400 400"
          height="100%"
          width="100%"
          xmlns="http://www.w3.org/2000/svg"
          aria-labelledby="decorativeBackgroundTitle"
          role="presentation"
        >
          <title id="decorativeBackgroundTitle">Decorative background gradient</title>
          <g clipPath="url(#clip0_10_20)">
            <g filter="url(#filter0_f_10_20)">
              <path
                d="M128.6 0H0V322.2L106.2 134.75L128.6 0Z"
                fill="#03FFE0"
              />
              <path
                d="M0 322.2V400H240H320L106.2 134.75L0 322.2Z"
                fill="#7C87F8"
              />
              <path
                d="M320 400H400V78.75L106.2 134.75L320 400Z"
                fill="#4C65E4"
              />
              <path
                d="M400 0H128.6L106.2 134.75L400 78.75V0Z"
                fill="#043AFF"
              />
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
                result="effect1_foregroundBlur_10_20"
                stdDeviation="80.1666"
              />
            </filter>
          </defs>
        </svg>
        <Image
          src={HeroImage}
          alt="Hero image"
          className="relative object-cover w-full border rounded-lg lg:rounded-xl shadow-xl"
        />
      </div>

      <div className="mt-6 mb-4">
        <Link href="/login">
          <RainbowButton>Let&apos;s GO!</RainbowButton>
        </Link>
      </div>
    </section>
  );
}
