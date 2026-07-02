import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Vaultify ZK-Secrets Console",
    short_name: "Vaultify",
    description: "Developer-first Zero-Knowledge secrets management and configuration synchronization platform.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#090909",
    theme_color: "#10b981",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
