import { LegalPageLayout } from "@/components/landing/legal-layout";

export default function AboutPage() {
  const sections = [
    {
      id: "our-mission",
      title: "Our Mission",
      content: (
        <>
          <p>
            Vaultify was built out of a simple frustration: managing environment variables across modern distributed architectures is tedious and fundamentally insecure. Developers are forced to choose between sharing plain `.env` files over Slack, or managing complex, slow key managers.
          </p>
          <p>
            Our mission is to make credential isolation and secure secret sync completely transparent. We package zero-knowledge, client-side encryption into developer-friendly CLI commands and browser interfaces.
          </p>
        </>
      )
    },
    {
      id: "zero-trust-philosophy",
      title: "The Zero-Trust Philosophy",
      content: (
        <>
          <p>
            At Vaultify, we believe security should never be an afterthought or a bottleneck. We enforce a zero-trust model:
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-2 text-zinc-400">
            <li><strong>No Plaintext:</strong> We never hold, read, or receive your raw decryption keys.</li>
            <li><strong>Automated Isolation:</strong> We make it simple to scope credentials by environment—securing production builds while leaving development workspaces open.</li>
            <li><strong>Developer First:</strong> All security protocols run instantly via our CLI during build and runtime processes.</li>
          </ul>
        </>
      )
    },
    {
      id: "our-architecture",
      title: "Secure Architecture",
      content: (
        <>
          <p>
            Vaultify functions as an end-to-end encrypted index. By utilizing standard Web Crypto APIs (PBKDF2 and AES-256-GCM), we guarantee that even in the event of an infrastructure breach, your application credentials remain completely secure.
          </p>
        </>
      )
    }
  ];

  return (
    <LegalPageLayout
      title="About Vaultify"
      subtitle="Discover the team, design principles, and developer-first security philosophy behind the Vaultify secret manager."
      lastUpdated="July 2026"
      sections={sections}
    />
  );
}
