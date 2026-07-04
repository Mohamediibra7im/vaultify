import { LegalPageLayout } from "@/components/landing/legal-layout";

export default function SecurityPage() {
  const sections = [
    {
      id: "zero-knowledge-architecture",
      title: "1. Zero-Knowledge Infrastructure Architecture",
      content: (
        <>
          <p>
            Vaultify is built on a Zero-Knowledge design pattern. The server acts as a secure data broker storing only cryptographically sealed envelopes.
          </p>
          <p>
            The master passphrase that derives the decryption keys remains local to your browser session or local developer terminal process memory. No raw secrets, plaintext environment variables, or passphrases are ever sent to our servers.
          </p>
        </>
      )
    },
    {
      id: "encryption-standards",
      title: "2. Cryptographic Encryption Standards",
      content: (
        <>
          <p>
            We implement industry-standard cryptographic algorithms:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-2 text-zinc-400 font-mono text-[10.5px]">
            <li>
              <strong>Key Derivation:</strong> PBKDF2 (Password-Based Key Derivation Function 2) with 100,000 iterations and a salted SHA-256 digest to derive client keys.
            </li>
            <li>
              <strong>Symmetric Encryption:</strong> AES-256-GCM (Advanced Encryption Standard in Galois/Counter Mode) with uniquely generated 12-byte initialization vectors (IVs) for every secret transaction.
            </li>
            <li>
              <strong>Network Security:</strong> Forced TLS 1.3 encryption tunnels for all active API interactions and webhook synchronizations.
            </li>
          </ul>
        </>
      )
    },
    {
      id: "cli-injection-security",
      title: "3. CLI Process Memory Injection Security",
      content: (
        <>
          <p>
            Unlike traditional secret management tools that write configuration environment scripts (`.env`) directly to your workspace storage disks, the Vaultify CLI uses process memory stream injection.
          </p>
          <p>
            The CLI retrieves the sealed envelopes, decrypts them in ephemeral memory space, and feeds the resulting environment array directly into the child process execution context:
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-2 text-zinc-400">
            <li>No unencrypted values are persisted to local hard drives.</li>
            <li>No plain files risk getting checked into Version Control Systems (Git).</li>
            <li>Once the terminal process exits, the decrypted memory is completely purged.</li>
          </ul>
        </>
      )
    },
    {
      id: "access-control-and-isolation",
      title: "4. Scopes, Roles & Workspace Isolation",
      content: (
        <>
          <p>
            We guarantee multi-tenant segregation and strict environment isolation:
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-2 text-zinc-400">
            <li><strong>Environment Partitioning:</strong> Development, staging, and production credential tags use different salt inputs and distinct isolation blocks.</li>
            <li><strong>RBAC Restrictions:</strong> Admin users can seal production scopes, preventing developers from syncing production keys locally while still allowing production CI/CD servers to run deployments.</li>
          </ul>
        </>
      )
    },
    {
      id: "vulnerability-disclosure",
      title: "5. Vulnerability Disclosure & Audit History",
      content: (
        <>
          <p>
            We take external audit contributions and vulnerability reporting very seriously.
          </p>
          <p>
            If you identify a security flaw or leak vector within the Vaultify platform or CLI client agent, please send reports directly to: <a href="mailto:mohamed.iibrahim.omar@gmail.com" className="font-mono text-primary select-all hover:underline">mohamed.iibrahim.omar@gmail.com</a>. We will review and remediate critical reports within 48 hours.
          </p>
        </>
      )
    }
  ];

  return (
    <LegalPageLayout
      title="Security Protocol"
      subtitle="Examine the cryptographic primitives, local process injections, and architectural constraints that seal your platform keys."
      lastUpdated="July 2026"
      sections={sections}
    />
  );
}
