import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";

export const runtime = "nodejs";

export const alt = "Vaultify | Zero-Knowledge Secrets Infrastructure";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  const interRegular = readFileSync(
    join(process.cwd(), "public", "fonts", "Inter-Regular.ttf")
  );
  const interBold = readFileSync(
    join(process.cwd(), "public", "fonts", "Inter-Bold.ttf")
  );
  const interExtraBold = readFileSync(
    join(process.cwd(), "public", "fonts", "Inter-ExtraBold.ttf")
  );
  const interMedium = readFileSync(
    join(process.cwd(), "public", "fonts", "Inter-Medium.ttf")
  );
  const interSemiBold = readFileSync(
    join(process.cwd(), "public", "fonts", "Inter-SemiBold.ttf")
  );
  const jetbrainsRegular = readFileSync(
    join(process.cwd(), "public", "fonts", "JetBrainsMono-Regular.ttf")
  );
  const jetbrainsBold = readFileSync(
    join(process.cwd(), "public", "fonts", "JetBrainsMono-Bold.ttf")
  );

  return new ImageResponse(
    (
      <div
        style={{
          background: "#09090B",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "row",
          alignItems: "stretch",
          justifyContent: "space-between",
          padding: "0",
          boxSizing: "border-box",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* === LAYERED BACKGROUND === */}

        {/* Base gradient — top-left to bottom-right */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(135deg, #0a0f14 0%, #09090B 40%, #0d1117 100%)",
          }}
        />

        {/* Large ambient glow — bottom-left */}
        <div
          style={{
            position: "absolute",
            bottom: "-40%",
            left: "-10%",
            width: "900px",
            height: "900px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(16,185,129,0.08) 0%, rgba(16,185,129,0.03) 35%, transparent 65%)",
            filter: "blur(80px)",
          }}
        />

        {/* Secondary glow — right, mid-height */}
        <div
          style={{
            position: "absolute",
            top: "10%",
            right: "-5%",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(52,211,153,0.05) 0%, transparent 55%)",
            filter: "blur(100px)",
          }}
        />

        {/* Subtle grid texture overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(255,255,255,0.015) 0px, rgba(255,255,255,0.015) 1px, transparent 1px, transparent 80px), repeating-linear-gradient(90deg, rgba(255,255,255,0.015) 0px, rgba(255,255,255,0.015) 1px, transparent 1px, transparent 80px)",
            backgroundPosition: "40px 40px",
          }}
        />

        {/* Top accent line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "2px",
            background:
              "linear-gradient(90deg, transparent 5%, rgba(16,185,129,0.4) 25%, rgba(52,211,153,0.6) 50%, rgba(16,185,129,0.4) 75%, transparent 95%)",
          }}
        />

        {/* Left accent edge */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            width: "2px",
            background:
              "linear-gradient(180deg, rgba(16,185,129,0.3) 0%, rgba(16,185,129,0.08) 50%, transparent 100%)",
          }}
        />

        {/* === LEFT COLUMN — 60% === */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            paddingLeft: "80px",
            paddingRight: "48px",
            width: "58%",
            zIndex: 10,
          }}
        >
          {/* Brand pill */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "32px",
            }}
          >
            {/* Logo */}
            <div
              style={{
                width: "44px",
                height: "44px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background:
                  "linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(16,185,129,0.04) 100%)",
                border: "1px solid rgba(16,185,129,0.2)",
                borderRadius: "12px",
              }}
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M24 4L42 14.4V33.6L24 44L6 33.6V14.4L24 4Z"
                  stroke="#10b981"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path
                  d="M13 17V31L24 37.5L28 35.1L17 28.7V19.3L13 17Z"
                  fill="#10b981"
                />
                <path
                  d="M35 17V31L24 37.5L20 35.1L31 28.7V19.3L35 17Z"
                  fill="#34d399"
                />
                <path
                  d="M24 13.5L32 18.2V27.8L24 32.5L16 27.8V18.2L24 13.5Z"
                  fill="#09090B"
                  stroke="#34d399"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path
                  d="M24 19C22.6193 19 21.5 20.1193 21.5 21.5C21.5 22.5607 22.1585 23.4682 23.0902 23.8345V27.5C23.0902 28.0523 23.5379 28.5 24.0902 28.5C24.6425 28.5 25.0902 28.0523 25.0902 27.5V23.8345C26.0219 23.4682 26.6804 22.5607 26.6804 21.5C26.6804 20.1193 25.5611 19 24 19Z"
                  fill="#10b981"
                />
              </svg>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "2px",
              }}
            >
              <span
                style={{
                  fontSize: "17px",
                  fontWeight: "600",
                  color: "#FAFAFA",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  fontFamily: "Inter",
                }}
              >
                Vaultify
              </span>
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: "500",
                  color: "#52525B",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  fontFamily: "JetBrains Mono",
                }}
              >
                Zero-Knowledge Engine
              </span>
            </div>
          </div>

          {/* Headline */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginBottom: "24px",
            }}
          >
            <span
              style={{
                fontSize: "48px",
                fontWeight: "800",
                color: "#FAFAFA",
                letterSpacing: "-0.045em",
                lineHeight: "1.05",
                fontFamily: "Inter",
              }}
            >
              Secrets that
            </span>
            <span
              style={{
                fontSize: "48px",
                fontWeight: "800",
                color: "#FAFAFA",
                letterSpacing: "-0.045em",
                lineHeight: "1.05",
                fontFamily: "Inter",
              }}
            >
              never touch
            </span>
            <span
              style={{
                fontSize: "48px",
                fontWeight: "800",
                color: "#FAFAFA",
                letterSpacing: "-0.045em",
                lineHeight: "1.05",
                fontFamily: "Inter",
              }}
            >
              disk.
            </span>
          </div>

          {/* Description */}
          <p
            style={{
              fontSize: "15px",
              color: "#71717A",
              margin: "0 0 36px 0",
              lineHeight: "1.7",
              maxWidth: "420px",
              fontFamily: "Inter",
            }}
          >
            Derive key rings in terminal memory. Stream decrypted variables
            directly to subprocesses. Zero plaintext on disk.
          </p>

          {/* Status row */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "center",
            }}
          >
            {[
              { label: "SECURE ENCLAVE", color: "#10B981", bg: "rgba(16,185,129,0.06)", border: "rgba(16,185,129,0.15)" },
              { label: "ZK-DECRYPTED", color: "#34D399", bg: "rgba(52,211,153,0.05)", border: "rgba(52,211,153,0.12)" },
              { label: "AES-256-GCM", color: "#6EE7B7", bg: "rgba(110,231,183,0.04)", border: "rgba(110,231,183,0.1)" },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "11px",
                  color: item.color,
                  border: `1px solid ${item.border}`,
                  background: item.bg,
                  padding: "8px 16px",
                  borderRadius: "6px",
                  fontWeight: "500",
                  letterSpacing: "0.06em",
                  fontFamily: "JetBrains Mono",
                }}
              >
                <div
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: item.color,
                    boxShadow: `0 0 8px ${item.color}66`,
                  }}
                />
                {item.label}
              </div>
            ))}
          </div>
        </div>

        {/* === RIGHT COLUMN — 42% === */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            paddingRight: "64px",
            width: "42%",
            zIndex: 10,
          }}
        >
          {/* Terminal card */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              background:
                "linear-gradient(145deg, rgba(12,12,15,0.97) 0%, rgba(8,8,10,0.99) 100%)",
              border: "1px solid rgba(16,185,129,0.12)",
              borderRadius: "14px",
              overflow: "hidden",
              boxShadow:
                "0 0 0 1px rgba(16,185,129,0.06), 0 24px 48px -12px rgba(0,0,0,0.6), 0 0 120px rgba(16,185,129,0.04)",
            }}
          >
            {/* Title bar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "rgba(6,6,8,0.9)",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
                padding: "12px 18px",
              }}
            >
              <div style={{ display: "flex", gap: "6px" }}>
                {[1, 2, 3].map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: "9px",
                      height: "9px",
                      borderRadius: "50%",
                      background:
                        i === 2
                          ? "#10B981"
                          : "rgba(255,255,255,0.06)",
                      boxShadow:
                        i === 2
                          ? "0 0 6px rgba(16,185,129,0.5)"
                          : "none",
                    }}
                  />
                ))}
              </div>
              <span
                style={{
                  fontSize: "11px",
                  color: "#52525B",
                  fontFamily: "JetBrains Mono",
                  letterSpacing: "0.03em",
                }}
              >
                vaultify-cli --daemon
              </span>
            </div>

            {/* Console body */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "22px 22px 18px 22px",
                gap: "7px",
                fontFamily: "JetBrains Mono",
                fontSize: "11.5px",
                lineHeight: "1.65",
                color: "#A1A1AA",
              }}
            >
              {/* Command prompt */}
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  marginBottom: "6px",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "14px",
                    height: "14px",
                    borderRadius: "3px",
                    background: "rgba(16,185,129,0.15)",
                  }}
                >
                  <span
                    style={{
                      fontSize: "9px",
                      color: "#10B981",
                      fontWeight: "700",
                      lineHeight: 1,
                    }}
                  >
                    {">"}
                  </span>
                </div>
                <span style={{ color: "#E4E4E7", fontWeight: "500" }}>
                  vaultify run -- npm run dev
                </span>
              </div>

              {/* Log lines */}
              {[
                {
                  time: "13:41:04",
                  label: "handshake",
                  labelColor: "#10B981",
                  msg: "secure ring cluster... ok",
                },
                {
                  time: "13:41:04",
                  label: "pbkdf2",
                  labelColor: "#34D399",
                  msg: "256-bit AES key derived in memory",
                },
                {
                  time: "13:41:05",
                  label: "aes-gcm",
                  labelColor: "#34D399",
                  msg: "16 client envelopes decrypted locally",
                },
                {
                  time: "13:41:05",
                  label: "process",
                  labelColor: "#34D399",
                  msg: "variables injected to subprocess",
                },
              ].map((line, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: "8px",
                    color: "#52525B",
                  }}
                >
                  <span>{line.time}</span>
                  <span style={{ color: line.labelColor }}>{line.label}</span>
                  <span>{line.msg}</span>
                </div>
              ))}

              {/* Ready line */}
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  alignItems: "center",
                  color: "#10B981",
                  marginTop: "8px",
                  paddingTop: "8px",
                  borderTop: "1px solid rgba(255,255,255,0.03)",
                }}
              >
                <div
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "#10B981",
                    boxShadow: "0 0 8px rgba(16,185,129,0.5)",
                  }}
                />
                <span style={{ fontWeight: "500" }}>Ready in 14ms</span>
              </div>
            </div>

            {/* Status bar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "rgba(6,6,8,0.9)",
                borderTop: "1px solid rgba(255,255,255,0.04)",
                padding: "10px 18px",
                fontSize: "10px",
                fontFamily: "JetBrains Mono",
                color: "#3F3F46",
              }}
            >
              <span>TLS 1.3 / AES-GCM</span>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  color: "#10B981",
                  fontWeight: "600",
                }}
              >
                <div
                  style={{
                    width: "5px",
                    height: "5px",
                    borderRadius: "50%",
                    background: "#10B981",
                    boxShadow: "0 0 6px rgba(16,185,129,0.5)",
                  }}
                />
                100% SECURE
              </div>
            </div>
          </div>

          {/* URL */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginTop: "20px",
            }}
          >
            <span
              style={{
                fontSize: "12px",
                color: "#3F3F46",
                fontFamily: "JetBrains Mono",
                letterSpacing: "0.05em",
              }}
            >
              vaultify.dev
            </span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Inter",
          data: interRegular,
          style: "normal",
          weight: 400,
        },
        {
          name: "Inter",
          data: interMedium,
          style: "normal",
          weight: 500,
        },
        {
          name: "Inter",
          data: interSemiBold,
          style: "normal",
          weight: 600,
        },
        {
          name: "Inter",
          data: interBold,
          style: "normal",
          weight: 700,
        },
        {
          name: "Inter",
          data: interExtraBold,
          style: "normal",
          weight: 800,
        },
        {
          name: "JetBrains Mono",
          data: jetbrainsRegular,
          style: "normal",
          weight: 400,
        },
        {
          name: "JetBrains Mono",
          data: jetbrainsBold,
          style: "normal",
          weight: 700,
        },
      ],
    }
  );
}
