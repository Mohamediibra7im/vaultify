import { LegalPageLayout } from "@/components/landing/legal-layout";

export default function TermsPage() {
  const sections = [
    {
      id: "acceptance-of-terms",
      title: "1. Acceptance of Terms",
      content: (
        <>
          <p>
            By accessing or using Vaultify (the &quot;Service&quot;), including our CLI agent, API, and web interface, you agree to be bound by these Terms of Service. If you do not agree to these terms, do not access or use the Service.
          </p>
          <p>
            We reserve the right to revise or update these terms at any time. We will indicate revisions by updating the &quot;Last updated&quot; date at the top of this document.
          </p>
        </>
      )
    },
    {
      id: "account-responsibility",
      title: "2. Account Responsibility & Passphrases",
      content: (
        <>
          <p>
            You are entirely responsible for:
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-2 text-zinc-400">
            <li>Maintaining the security of your GitHub OAuth tokens and Vaultify credentials.</li>
            <li>Guarding the master passphrase used to derive your client-side encryption keys.</li>
            <li>All activities, commits, CLI fetches, or environment integrations that occur under your user identity.</li>
          </ul>
          <p className="mt-2 text-rose-400 font-semibold font-mono text-[10.5px]">
            WARNING: Vaultify does not store or transmit your master passphrase. If you lose your passphrase, all associated workspace ciphertexts will become permanently unrecoverable. Vaultify support cannot recover it.
          </p>
        </>
      )
    },
    {
      id: "acceptable-use",
      title: "3. Acceptable Use and Restrictions",
      content: (
        <>
          <p>
            You agree not to use the Service to:
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-2 text-zinc-400">
            <li>Host, distribute, or inject secrets related to illegal materials or malicious software (malware, keyloggers, etc.).</li>
            <li>Interfere with, disrupt, or perform unauthorized stress testing/DDoS attacks on the Vaultify API clusters.</li>
            <li>Circumvent or attempt to compromise workspace RBAC bounds, environment isolation shields, or key validation rings.</li>
          </ul>
        </>
      )
    },
    {
      id: "intellectual-property",
      title: "4. Intellectual Property Rights",
      content: (
        <>
          <p>
            The software, layout, console logic, CLI client, design language, and brand assets of Vaultify are owned by Vaultify and protected by copyright laws.
          </p>
          <p>
            Vaultify grants you a limited, non-exclusive, non-transferable, and revocable license to use our CLI binary client and web application for environment key orchestration.
          </p>
        </>
      )
    },
    {
      id: "disclaimer-limitation-of-liability",
      title: "5. Disclaimer & Limitation of Liability",
      content: (
        <>
          <p>
            THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTY OF ANY KIND.
          </p>
          <p>
            To the maximum extent permitted by applicable law, Vaultify shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits, data, environment uptime, database secrets, or master passphrases resulting from your use of the Service.
          </p>
        </>
      )
    }
  ];

  return (
    <LegalPageLayout
      title="Terms of Service"
      subtitle="Read the agreement details governing your usage of Vaultify, client-side secret management, and user compliance responsibilities."
      lastUpdated="July 2026"
      sections={sections}
    />
  );
}
