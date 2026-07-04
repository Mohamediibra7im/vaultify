import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://vaultiify.vercel.app";

export const metadata: Metadata = {
  title: {
    default: "Vaultify | Zero-Knowledge Secrets Manager",
    template: "%s | Vaultify"
  },
  description: "Vaultify is a zero-knowledge secrets management platform for teams. Organize workspaces, projects, environments, and encrypted secrets with audit-ready access control.",
  metadataBase: new URL(siteUrl),
  keywords: [
    "secrets manager",
    "zero knowledge secrets",
    "workspace secrets",
    "zero knowledge encryption",
    "env variables",
    "dotenv sync",
    "developer console",
    "audit logs",
    "team secrets"
  ],
  authors: [{ name: "Mohamed Ibrahim" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    title: "Vaultify | Zero-Knowledge Secrets Manager",
    description: "Vaultify helps teams organize and secure secrets across workspaces, projects, and environments with audit-ready access control.",
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
    title: "Vaultify | Zero-Knowledge Secrets Manager",
    description: "Vaultify secures team secrets across workspaces, projects, environments, and audit logs.",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
  }
};
