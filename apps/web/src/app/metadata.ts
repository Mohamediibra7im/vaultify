import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Vaultify | ZK-Encryption Secrets Manager",
    template: "%s | Vaultify"
  },
  description: "Secure, developer-first secrets management console. Sync environment variables, audit access telemetry, and manage team scopes with Zero-Knowledge encryption.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  keywords: [
    "secrets manager",
    "zero knowledge encryption",
    "env variables",
    "dotenv sync",
    "developer console",
    "security keys",
    "cryptographic workflow"
  ],
  authors: [{ name: "Vaultify Engineering" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://vaultify.io",
    title: "Vaultify | ZK-Encryption Secrets Manager",
    description: "Secure, developer-first secrets management console. Sync environment variables, audit access telemetry, and manage team scopes.",
    siteName: "Vaultify",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Vaultify Cryptographic Secrets Console",
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Vaultify | ZK-Encryption Secrets Manager",
    description: "Secure, developer-first secrets management console with live telemetry logs.",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
  }
};
