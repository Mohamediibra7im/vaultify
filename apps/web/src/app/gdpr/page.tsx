import { LegalPageLayout } from "@/components/landing/legal-layout";

export default function GDPRPage() {
  const sections = [
    {
      id: "gdpr-compliance-commitment",
      title: "1. GDPR Compliance Commitment",
      content: (
        <>
          <p>
            The General Data Protection Regulation (GDPR) is a comprehensive EU data privacy regulation. Vaultify is committed to compliance with all GDPR guidelines regarding the storage, processing, and handling of European Union resident data.
          </p>
          <p>
            Because we use a zero-knowledge cryptographic model, Vaultify is uniquely aligned with GDPR&apos;s core values of data minimization, privacy-by-design, and user autonomy.
          </p>
        </>
      )
    },
    {
      id: "data-minimization-and-purposes",
      title: "2. Data Minimization & Processing Purposes",
      content: (
        <>
          <p>
            Under GDPR Article 5, personal data processing must be limited to what is necessary. Vaultify complies by:
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-2 text-zinc-400">
            <li>Only collecting minimal metadata (name, email via OAuth) to facilitate authentication.</li>
            <li>Avoiding collection of unrelated tracking data, background telemetry, or marketing logs.</li>
            <li>Storing client credentials only as encrypted ciphertexts, which do not qualify as legible personal data since they cannot be deciphered by our systems.</li>
          </ul>
        </>
      )
    },
    {
      id: "rights-of-data-subjects",
      title: "3. Your Rights as a Data Subject",
      content: (
        <>
          <p>
            EU citizens and residents hold specific rights under GDPR:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-2 text-zinc-400">
            <li>
              <strong>Right to Rectification (Article 16):</strong> You can correct your user profile credentials at any time in the Vaultify Console.
            </li>
            <li>
              <strong>Right to Erasure (Article 17 - &quot;Right to be Forgotten&quot;):</strong> Deleting your Vaultify account permanently destroys all associated record tables, auth connections, and ciphertext segments immediately.
            </li>
            <li>
              <strong>Right to Portability (Article 20):</strong> You can instantly export all decrypted environment parameters to standard JSON/env files using our open CLI agent.
            </li>
          </ul>
        </>
      )
    },
    {
      id: "data-processor-role",
      title: "4. Data Processor vs. Controller Roles",
      content: (
        <>
          <p>
            In the context of the GDPR:
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-2 text-zinc-400">
            <li>
              <strong>Vaultify as Controller:</strong> Vaultify is the data controller for the basic user metadata (account information, emails) required to register your workspace.
            </li>
            <li>
              <strong>Vaultify as Processor:</strong> Vaultify acts as a data processor for the encrypted secret envelopes you ingest. Because this data is client-side encrypted, we have no access to the keys necessary to process or read the content.
            </li>
          </ul>
        </>
      )
    },
    {
      id: "contact-dpo",
      title: "5. Contacting our Data Protection Representative",
      content: (
        <>
          <p>
            If you have questions about our GDPR compliance framework, data processing procedures, or wish to file a formal request to purge your account data, please contact our Data Protection Officer at: <span className="font-mono text-primary select-all">dpo@vaultify.dev</span>.
          </p>
        </>
      )
    }
  ];

  return (
    <LegalPageLayout
      title="GDPR Compliance"
      subtitle="Examine our data protection commitments, subject rights, and zero-knowledge alignment under the General Data Protection Regulation."
      lastUpdated="July 2026"
      sections={sections}
    />
  );
}
