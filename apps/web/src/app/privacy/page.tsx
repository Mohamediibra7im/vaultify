import { LegalPageLayout } from "@/components/landing/legal-layout";

export default function PrivacyPage() {
  const sections = [
    {
      id: "information-we-collect",
      title: "1. Information We Collect",
      content: (
        <>
          <p>
            Vaultify is a zero-knowledge service. Our platform architecture ensures that we do not have access to, nor do we store, your unencrypted secret keys or environmental variables.
          </p>
          <p className="font-bold text-foreground">
            A. Account Registration & User Information:
          </p>
          <p>
            When you sign up, we collect basic parameters such as your email address, name, profile picture, and team credentials through external authorization providers (OAuth via GitHub).
          </p>
          <p className="font-bold text-foreground">
            B. Client-side Metadata & Envelope Settings:
          </p>
          <p>
            We collect system logs including client agent version, IP address (for security audit logs), workspace names, and configuration targets (Vercel, AWS Parameter Store, Docker endpoints).
          </p>
        </>
      )
    },
    {
      id: "zero-knowledge-encryption",
      title: "2. Zero-Knowledge Cryptographic Model",
      content: (
        <>
          <p>
            We enforce strict client-side encryption. All credentials, secret values, and environmental strings are encrypted on your local hardware device using AES-256-GCM prior to network transmission.
          </p>
          <p>
            The decryption keys are derived from your master passphrase, which is never sent to our servers. Because of this zero-knowledge model:
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-2 text-zinc-400">
            <li>We cannot decrypt your secrets, even if requested by third-party authorities.</li>
            <li>We cannot recover your master passphrase if lost.</li>
            <li>Database breaches on Vaultify infrastructure will only yield encrypted ciphertexts and iv salts.</li>
          </ul>
        </>
      )
    },
    {
      id: "how-we-use-information",
      title: "3. How We Use Information",
      content: (
        <>
          <p>
            We utilize collected account metadata to:
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-2 text-zinc-400">
            <li>Provide, maintain, and secure the Vaultify Console.</li>
            <li>Deliver real-time telemetry updates and team member activity notifications.</li>
            <li>Verify credentials and manage RBAC scopes across active workspaces.</li>
            <li>Prevent abuse, platform spamming, or fraudulent authentication calls.</li>
          </ul>
        </>
      )
    },
    {
      id: "data-sharing-disclosure",
      title: "4. Data Sharing and Third Parties",
      content: (
        <>
          <p>
            Vaultify does not trade, sell, or rent your personal user information. We only share operational state metadata with critical runtime sub-processors:
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-2 text-zinc-400">
            <li>Hosting & Cloud Infrastructure providers (for platform execution).</li>
            <li>OAuth authentication providers (GitHub) to verify user identities.</li>
            <li>Monitoring services (Sentry) for real-time error logging.</li>
          </ul>
        </>
      )
    },
    {
      id: "user-rights",
      title: "5. Your Rights and Data Deletion",
      content: (
        <>
          <p>
            You have full control over your credentials and team data:
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-2 text-zinc-400">
            <li><strong>Exporting:</strong> You can export/decrypt your secrets locally at any time using the Vaultify CLI.</li>
            <li><strong>Deletion:</strong> Initiating workspace or account deletion completely and permanently purges all ciphertexts, salts, and audit history metadata from our operational database clusters.</li>
          </ul>
        </>
      )
    }
  ];

  return (
    <LegalPageLayout
      title="Privacy Policy"
      subtitle="Understand how Vaultify stores metadata and secures your developer profiles using client-side zero-knowledge protocols."
      lastUpdated="July 2026"
      sections={sections}
    />
  );
}
