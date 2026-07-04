import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Vaultify",
    short_name: "Vaultify",
    description: "Zero-knowledge secrets management for teams, projects, environments, and audit-ready access control.",
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
