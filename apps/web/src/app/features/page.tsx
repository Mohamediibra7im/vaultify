import { LegalPageLayout } from "@/components/landing/legal-layout";

export default function FeaturesPage() {
  const sections = [
    {
      id: "real-time-sync",
      title: "1. Real-time Terminal Sync",
      content: (
        <>
          <p>
            Vaultify synchronizes environment parameters across connected terminals and microservices in real time. 
            When an administrator rotates a key or updates an active secret in the Web Console:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 mt-2 text-zinc-400">
            <li>Connected CLI sessions receive update events instantly.</li>
            <li>Production processes are signaled to re-fetch and apply new envelopes hot (without rebooting if supported).</li>
            <li>Eliminates stale local config mismatches and copy-paste friction across the developer team.</li>
          </ul>
        </>
      )
    },
    {
      id: "immutable-audit-logs",
      title: "2. Immutable Security Audit Logs",
      content: (
        <>
          <p>
            All administrative, developer, and machine integrations are tracked inside an immutable, cryptographic audit feed:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 mt-2 text-zinc-400">
            <li><strong>Action Attribution:</strong> Logs record who (user, service key, or token), when, and from what IP address a variable was modified or decrypted.</li>
            <li><strong>Tamper Evident:</strong> Each audit trail contains SHA-256 validation signatures matching SOC2 compliance requirements.</li>
            <li><strong>Real-time Block Feed:</strong> Unapproved, unauthorized or warning actions trigger instant alert emails and Slack webhook warnings.</li>
          </ul>
        </>
      )
    },
    {
      id: "cli-process-injection",
      title: "3. CLI Process Memory Injection",
      content: (
        <>
          <p>
            Traditional environment management requires checking plain configuration files (`.env`) to local disk space. 
            Vaultify overrides this insecure pattern:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 mt-2 text-zinc-400">
            <li>The CLI agent pulls encrypted envelopes, derives keys in memory, and decrypts the payload.</li>
            <li>Secrets are directly stream-injected into the child process memory space at runtime (`process.env`).</li>
            <li>Zero plaintext values are written to disk, preventing accidental leaks via Git commits.</li>
          </ul>
        </>
      )
    },
    {
      id: "promotion-scopes",
      title: "4. Multi-Environment Promotion Scopes",
      content: (
        <>
          <p>
            Manage isolated promotion rings across development, staging, and production environments:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 mt-2 text-zinc-400">
            <li><strong>RBAC Restrictions:</strong> Limit write permissions on staging and production rings to authorized admins.</li>
            <li><strong>One-Click Promotion:</strong> Promote verified keys from development directly to staging, or staging to production securely with value verification checks.</li>
            <li><strong>Scope Inheritance:</strong> Configure global workspace keys that are inherited across all scopes automatically.</li>
          </ul>
        </>
      )
    }
  ];

  return (
    <LegalPageLayout
      title="Platform Features"
      subtitle="Examine the core capabilities, real-time sync networks, and security infrastructure built into the Vaultify Console."
      lastUpdated="July 2, 2026"
      sections={sections}
    />
  );
}
