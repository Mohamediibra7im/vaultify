import { LegalPageLayout } from "@/components/landing/legal-layout";

export default function ChangelogPage() {
  const sections = [
    {
      id: "v1.2.0",
      title: "v1.2.0 — Zero-Knowledge Engine Overhaul",
      content: (
        <>
          <p className="font-mono text-xs text-zinc-500 mb-2">Released: July 2, 2026</p>
          <p>
            This release introduces major cryptographic architecture upgrades alongside developer experience improvements.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 mt-3 text-zinc-400">
            <li><strong>Zero-Knowledge Engine:</strong> Enforced client-side salting via PBKDF2 with 100,000 iterations to derive master decryption keys locally in the browser/CLI.</li>
            <li><strong>CLI Process Stream Injection:</strong> Vaultify CLI now stream-injects environment parameters straight to child process memories without writing any plain files to the workspace disk.</li>
            <li><strong>Glassmorphic ConfirmDialogs:</strong> Replaced all native browser confirmation prompts with custom, monospaced terminal confirm dialogs for revoking access, removing members, and deleting projects.</li>
          </ul>
        </>
      )
    },
    {
      id: "v1.1.0",
      title: "v1.1.0 — Multi-Scope Environment Partitioning",
      content: (
        <>
          <p className="font-mono text-xs text-zinc-500 mb-2">Released: June 15, 2026</p>
          <p>
            Introduced environment separation bounds to safely isolate production variables from staging and development builds.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 mt-3 text-zinc-400">
            <li><strong>Sealed Scopes:</strong> Production variables are completely sealed for developers without admin roles.</li>
            <li><strong>Auto-Sync Engine:</strong> Integrated Vercel Sync Hooks and AWS Parameter Store connections to automatically trigger synchronization on secret updates.</li>
          </ul>
        </>
      )
    },
    {
      id: "v1.0.0",
      title: "v1.0.0 — Public Release",
      content: (
        <>
          <p className="font-mono text-xs text-zinc-500 mb-2">Released: May 20, 2026</p>
          <p>
            Official release of Vaultify. Stop sharing `.env` scripts over chat applications and secure your microservices with a unified console.
          </p>
        </>
      )
    }
  ];

  return (
    <LegalPageLayout
      title="Platform Changelog"
      subtitle="Follow the progress, cryptographic features, and CLI tool updates released by the Vaultify engineering team."
      lastUpdated="July 2, 2026"
      sections={sections}
    />
  );
}
