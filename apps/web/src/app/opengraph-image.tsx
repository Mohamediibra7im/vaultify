import { ImageResponse } from "next/og";

export const alt = "Vaultify | Zero-Knowledge Secrets Infrastructure";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#030304",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "60px 80px",
          boxSizing: "border-box",
          position: "relative",
        }}
      >
        {/* Glow ambient background spotlights */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "20%",
            transform: "translate(-50%, -50%)",
            width: "600px",
            height: "600px",
            background: "radial-gradient(circle, rgba(16,185,129,0.12) 0%, rgba(0,0,0,0) 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "40%",
            right: "10%",
            width: "500px",
            height: "500px",
            background: "radial-gradient(circle, rgba(16,185,129,0.08) 0%, rgba(0,0,0,0) 70%)",
          }}
        />

        {/* Matrix dot grid overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.08,
            backgroundImage: "radial-gradient(#10b981 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Outer security border frame */}
        <div
          style={{
            position: "absolute",
            inset: "20px",
            border: "1px solid rgba(16,185,129,0.05)",
            borderRadius: "16px",
            pointerEvents: "none",
          }}
        />

        {/* LEFT COLUMN: PRODUCT VALUE & BRAND */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            maxWidth: "520px",
            zIndex: 10,
          }}
        >
          {/* Brand header */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "32px" }}>
            <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
              <path
                d="M24 4L42 14.4V33.6L24 44L6 33.6V14.4L24 4Z"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              <path d="M13 17V31L24 37.5L28 35.1L17 28.7V19.3L13 17Z" fill="#10b981" />
              <path d="M35 17V31L24 37.5L20 35.1L31 28.7V19.3L35 17Z" fill="#34d399" />
              <path
                d="M24 13.5L32 18.2V27.8L24 32.5L16 27.8V18.2L24 13.5Z"
                fill="#030304"
                stroke="#34d399"
                strokeWidth="2.2"
                strokeLinejoin="round"
              />
              <path
                d="M24 19C22.6193 19 21.5 20.1193 21.5 21.5C21.5 22.5607 22.1585 23.4682 23.0902 23.8345V27.5C23.0902 28.0523 23.5379 28.5 24.0902 28.5C24.6425 28.5 25.0902 28.0523 25.0902 27.5V23.8345C26.0219 23.4682 26.6804 22.5607 26.6804 21.5C26.6804 20.1193 25.5611 19 24 19Z"
                fill="#10b981"
              />
            </svg>
            <span
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                color: "#ffffff",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                fontFamily: "monospace",
              }}
            >
              Vaultify
            </span>
          </div>

          <h2
            style={{
              fontSize: "46px",
              fontWeight: "900",
              color: "#ffffff",
              margin: "0 0 16px 0",
              letterSpacing: "-0.03em",
              lineHeight: "1.15",
            }}
          >
            Zero-Knowledge <span style={{ color: "#10b981" }}>Secrets Engine</span>
          </h2>

          <p
            style={{
              fontSize: "17px",
              color: "#94a3b8",
              margin: "0 0 36px 0",
              lineHeight: "1.6",
            }}
          >
            Derive key rings in terminal memory and stream decrypted variables directly to subprocesses. Stop storing plaintext configurations on local disk space.
          </p>

          {/* Infrastructure status pills */}
          <div style={{ display: "flex", gap: "12px" }}>
            <span
              style={{
                fontSize: "11px",
                color: "#10b981",
                border: "1px solid rgba(16,185,129,0.2)",
                background: "rgba(16,185,129,0.06)",
                padding: "6px 14px",
                borderRadius: "9999px",
                fontWeight: "bold",
                letterSpacing: "0.08em",
              }}
            >
              ● SECURE ENCLAVE
            </span>
            <span
              style={{
                fontSize: "11px",
                color: "#10b981",
                border: "1px solid rgba(16,185,129,0.2)",
                background: "rgba(16,185,129,0.06)",
                padding: "6px 14px",
                borderRadius: "9999px",
                fontWeight: "bold",
                letterSpacing: "0.08em",
              }}
            >
              ● ZK-DECRYPTED
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: HIGH-TECH TERMINAL DAEMON MOCKUP */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "480px",
            background: "rgba(6, 6, 8, 0.8)",
            border: "1px solid rgba(16, 185, 129, 0.15)",
            borderRadius: "14px",
            padding: "0",
            zIndex: 10,
            boxShadow: "0 30px 60px rgba(0,0,0,0.6)",
            overflow: "hidden",
          }}
        >
          {/* Terminal Title Bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "rgba(10, 10, 14, 0.9)",
              borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
              padding: "14px 20px",
            }}
          >
            <div style={{ display: "flex", gap: "6px" }}>
              <div style={{ width: "9px", height: "9px", borderRadius: "50%", background: "#ef4444" }} />
              <div style={{ width: "9px", height: "9px", borderRadius: "50%", background: "#eab308" }} />
              <div style={{ width: "9px", height: "9px", borderRadius: "50%", background: "#10b981" }} />
            </div>
            <span style={{ fontSize: "10px", color: "#64748b", fontFamily: "monospace", letterSpacing: "0.05em" }}>
              vaultify-cli --daemon
            </span>
          </div>

          {/* Terminal Console Logs */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              padding: "24px",
              gap: "10px",
              fontFamily: "monospace",
              fontSize: "11px",
              lineHeight: "1.5",
              color: "#cbd5e1",
            }}
          >
            <div style={{ display: "flex", gap: "8px" }}>
              <span style={{ color: "#10b981" }}>$</span>
              <span>vaultify run -- npm run dev</span>
            </div>
            <div style={{ display: "flex", gap: "8px", color: "#64748b", marginTop: "4px" }}>
              <span>[13:41:04]</span>
              <span style={{ color: "#34d399" }}>[Handshake]</span>
              <span>Connecting to secure ring cluster... OK</span>
            </div>
            <div style={{ display: "flex", gap: "8px", color: "#64748b" }}>
              <span>[13:41:04]</span>
              <span style={{ color: "#34d399" }}>[PBKDF2]</span>
              <span>Derived 256-bit AES master key in memory</span>
            </div>
            <div style={{ display: "flex", gap: "8px", color: "#64748b" }}>
              <span>[13:41:05]</span>
              <span style={{ color: "#34d399" }}>[AES-GCM]</span>
              <span>Decrypted 16 client envelopes locally</span>
            </div>
            <div style={{ display: "flex", gap: "8px", color: "#64748b" }}>
              <span>[13:41:05]</span>
              <span style={{ color: "#34d399" }}>[Process]</span>
              <span>Injected variables directly to subprocess</span>
            </div>
            <div style={{ display: "flex", gap: "8px", color: "#10b981", marginTop: "6px" }}>
              <span>&gt; Ready in 14ms (AES-256 decrypted)</span>
            </div>
          </div>

          {/* Encryption Protocol Info Bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "rgba(10, 10, 14, 0.9)",
              borderTop: "1px solid rgba(255, 255, 255, 0.05)",
              padding: "12px 24px",
              fontSize: "9px",
              fontFamily: "monospace",
              color: "#64748b",
            }}
          >
            <span>PROTOCOL: TLS 1.3 / AES-GCM</span>
            <span style={{ color: "#10b981", fontWeight: "bold" }}>SECURE STATUS: 100%</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
