import type { ComponentProps } from "react";

export function VaultifyLogo(props: ComponentProps<"svg">) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <defs>
        {/* Primary Emerald/Mint Gradients for Lock Ribbons */}
        <linearGradient id="logoGradPrimary" x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="60%" stopColor="#059669" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
        
        <linearGradient id="logoGradSecondary" x1="42" y1="4" x2="6" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="50%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#065f46" />
        </linearGradient>

        {/* Ambient Back Glow */}
        <radialGradient id="logoAmbientGlow" cx="24" cy="24" r="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
        </radialGradient>

        {/* High-Fidelity Glow Filter */}
        <filter id="logoGlowEffect" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Ambient background glow path */}
      <path
        d="M24 6L40 15.2V32.8L24 42L8 32.8V15.2L24 6Z"
        fill="url(#logoAmbientGlow)"
        className="pointer-events-none"
      />

      {/* Outer Hexagonal Grid Frame */}
      <path
        d="M24 4L42 14.4V33.6L24 44L6 33.6V14.4L24 4Z"
        stroke="url(#logoGradPrimary)"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeOpacity="0.25"
      />

      {/* Interlocking 3D "V" bands (Left and Right sides) */}
      {/* Left Ribbon */}
      <path
        d="M13 17V31L24 37.5L28 35.1L17 28.7V19.3L13 17Z"
        fill="url(#logoGradPrimary)"
        filter="url(#logoGlowEffect)"
      />

      {/* Right Ribbon */}
      <path
        d="M35 17V31L24 37.5L20 35.1L31 28.7V19.3L35 17Z"
        fill="url(#logoGradSecondary)"
        filter="url(#logoGlowEffect)"
      />

      {/* Central Floating Lock Crystal */}
      <path
        d="M24 13.5L32 18.2V27.8L24 32.5L16 27.8V18.2L24 13.5Z"
        fill="#090909"
        stroke="url(#logoGradSecondary)"
        strokeWidth="2"
        strokeLinejoin="round"
        filter="url(#logoGlowEffect)"
      />

      {/* Precise Keyhole Shape */}
      <path
        d="M24 19C22.6193 19 21.5 20.1193 21.5 21.5C21.5 22.5607 22.1585 23.4682 23.0902 23.8345V27.5C23.0902 28.0523 23.5379 28.5 24.0902 28.5C24.6425 28.5 25.0902 28.0523 25.0902 27.5V23.8345C26.0219 23.4682 26.6804 22.5607 26.6804 21.5C26.6804 20.1193 25.5611 19 24 19Z"
        fill="url(#logoGradPrimary)"
      />
    </svg>
  );
}
