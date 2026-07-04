import {LegalPageLayout} from "@/components/landing/legal-layout";

export default function AboutPage() {
  const sections = [
    {
      id: "our-mission",
      title: "Our Mission",
      content: (
        <>
          <p>
            Vaultify was built to replace the messy habit of passing `.env`
            files around chat apps and email threads. It gives teams a clear
            place to store, share, and audit secrets without losing track of
            where sensitive values live.
          </p>
          <p>
            Our mission is to make credential isolation and secure secret sync
            feel direct and reliable. We package zero-knowledge encryption into
            developer-friendly CLI commands and a web console that works the way
            modern teams actually ship software.
          </p>
        </>
      ),
    },
    {
      id: "zero-trust-philosophy",
      title: "The Zero-Trust Philosophy",
      content: (
        <>
          <p>
            At Vaultify, we believe security should never be an afterthought or
            a bottleneck. We enforce a zero-trust model:
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-2 text-zinc-400">
            <li>
              <strong>No Plaintext:</strong> We never hold, read, or receive
              your raw decryption keys.
            </li>
            <li>
              <strong>Automated Isolation:</strong> We make it simple to scope
              credentials by workspace, project, and environment so production
              stays protected while development stays fast.
            </li>
            <li>
              <strong>Developer First:</strong> All security protocols run
              instantly via our CLI during build and runtime processes.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "our-architecture",
      title: "Secure Architecture",
      content: (
        <>
          <p>
            Vaultify functions as an end-to-end encrypted secrets layer. By
            using standard cryptography primitives, we keep secrets encrypted at
            rest and reduce the amount of sensitive data exposed to the platform
            itself.
          </p>
        </>
      ),
    },
  ];

  return (
    <LegalPageLayout
      title="About Vaultify"
      subtitle="Discover the product story, design principles, and security model behind the Vaultify secrets platform."
      lastUpdated="July 2026"
      sections={sections}
    />
  );
}
