import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "transparent",
        }}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 48 48"
          fill="none"
        >
          {/* Outer Hexagonal Frame */}
          <path
            d="M24 4L42 14.4V33.6L24 44L6 33.6V14.4L24 4Z"
            stroke="#10b981"
            strokeWidth="3.2"
            strokeLinejoin="round"
          />

          {/* Left Ribbon */}
          <path
            d="M13 17V31L24 37.5L28 35.1L17 28.7V19.3L13 17Z"
            fill="#10b981"
          />

          {/* Right Ribbon */}
          <path
            d="M35 17V31L24 37.5L20 35.1L31 28.7V19.3L35 17Z"
            fill="#34d399"
          />

          {/* Central Floating Lock Crystal */}
          <path
            d="M24 13.5L32 18.2V27.8L24 32.5L16 27.8V18.2L24 13.5Z"
            fill="#090909"
            stroke="#34d399"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Precise Keyhole Shape */}
          <path
            d="M24 19C22.6193 19 21.5 20.1193 21.5 21.5C21.5 22.5607 22.1585 23.4682 23.0902 23.8345V27.5C23.0902 28.0523 23.5379 28.5 24.0902 28.5C24.6425 28.5 25.0902 28.0523 25.0902 27.5V23.8345C26.0219 23.4682 26.6804 22.5607 26.6804 21.5C26.6804 20.1193 25.5611 19 24 19Z"
            fill="#10b981"
          />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
