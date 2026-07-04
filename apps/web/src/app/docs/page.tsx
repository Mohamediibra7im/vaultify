import { LegalPageLayout } from "@/components/landing/legal-layout";

export default function DocsPage() {
  const code = (text: string) => (
    <pre className="bg-zinc-950 border border-white/5 p-4.5 rounded-xl font-mono text-[10.5px] text-primary select-all mt-3 overflow-x-auto whitespace-pre">
      {text}
    </pre>
  );

  const inlineCode = (text: string) => (
    <code className="bg-zinc-900/80 border border-white/5 px-1.5 py-0.5 rounded text-[10px] text-primary font-mono">
      {text}
    </code>
  );

  const table = (headers: string[], rows: string[][]) => (
    <div className="overflow-x-auto mt-3">
      <table className="w-full border-collapse text-[10.5px] font-mono">
        <thead>
          <tr className="border-b border-white/10">
            {headers.map((h, i) => (
              <th key={i} className="text-left py-2 px-3 text-primary font-bold uppercase tracking-wider text-[9px]">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
              {row.map((cell, ci) => (
                <td key={ci} className="py-2 px-3 text-zinc-300">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const sections = [
    {
      id: "problems",
      title: "1. Problems Vaultify Solves",
      content: (
        <>
          <p className="mb-3">
            Most teams manage secrets the same way they did ten years ago — sharing {inlineCode(".env")} files through Slack, email, or Notion. This creates real problems:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-zinc-400">
            <li><strong className="text-foreground">No audit trail.</strong> When a secret leaks, you have no way to know who saw it or when.</li>
            <li><strong className="text-foreground">Configuration drift.</strong> Development, staging, and production environments get out of sync. A missing variable breaks a deployment.</li>
            <li><strong className="text-foreground">No version history.</strong> Change a secret and the old value is gone forever. Rollback means digging through git history or backups.</li>
            <li><strong className="text-foreground">Onboarding friction.</strong> Every new team member needs the latest {inlineCode(".env")} file. Sharing it is manual and insecure.</li>
            <li><strong className="text-foreground">CI/CD exposure.</strong> Pipeline secrets are visible to anyone with access to the CI dashboard, even if they should not see production credentials.</li>
            <li><strong className="text-foreground">No access control.</strong> Once someone has the {inlineCode(".env")} file, they have everything — development, staging, and production keys alike.</li>
          </ul>
          <p className="mt-4">
            Vaultify solves these problems by giving teams a centralized, encrypted vault for secrets with granular access control, full audit logging, and environment-level isolation.
          </p>
        </>
      ),
    },
    {
      id: "features",
      title: "2. Key Features",
      content: (
        <>
          <div className="space-y-4">
            {[
              ["AES-256-GCM Encryption at Rest", "Every secret value is encrypted with a unique initialization vector before storage. Your data is never stored in plaintext."],
              ["Team Workspaces with RBAC", "Organize secrets by team. Three roles — Owner, Editor, Viewer — with per-environment overrides for fine-grained access control."],
              ["Multi-Environment Isolation", "Separate environments for development, staging, and production. Each has its own isolated secrets and independent access controls."],
              ["Environment Diff", "Compare secrets across environments side-by-side. Catch configuration drift before it reaches production."],
              ["Immutable Audit Trail", "Every read, write, reveal, and change is logged immutably. Know exactly who saw what and when."],
              ["Version History & Rollback", "Every secret change is versioned. Roll back to any previous version in a single click."],
              [".env Import / Export", "Import existing secrets from .env files. Export anytime for local development or backup."],
              ["Click-to-Reveal", "Secret values are masked by default in the dashboard. Each reveal is audit-logged for accountability."],
              ["API Tokens for CI/CD", "Generate scoped tokens for pipelines. Prefix-based identification makes token management easy."],
              ["GitHub OAuth", "One-click sign-in with GitHub alongside traditional email and password authentication."],
              ["CLI Tool", "Pull secrets and inject them directly into your application runtime — no .env file written to disk."],
            ].map(([feature, desc]) => (
              <div key={feature} className="border border-white/5 bg-zinc-950/20 rounded-xl p-4 hover:border-white/10 transition-colors">
                <h4 className="text-xs font-bold text-foreground mb-1">{feature}</h4>
                <p className="text-[11px] text-zinc-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </>
      ),
    },
    {
      id: "how-it-works",
      title: "3. How It Works",
      content: (
        <>
          <p>
            Vaultify organizes secrets in a structured hierarchy: <strong className="text-foreground">Workspace → Project → Environment → Secret</strong>.
          </p>
          {table(
            ["Level", "Description"],
            [
              ["Workspace", "Top-level container for a team or organization. Members are assigned roles here."],
              ["Project", "A service or application — for example, 'backend-api' or 'mobile-app'."],
              ["Environment", "A deployment stage within a project — development, staging, production."],
              ["Secret", "An encrypted key-value pair stored in a specific environment."],
            ]
          )}
          <p className="mt-4">
            Each level adds isolation. A developer might have Editor access to staging secrets but read-only access to production. Changes are tracked with version history so nothing is ever lost.
          </p>
        </>
      ),
    },
    {
      id: "quickstart",
      title: "4. Getting Started",
      content: (
        <>
          <p>
            Vaultify is a self-hosted platform. You deploy the API server and access the dashboard from your browser.
          </p>
          <h3 className="text-sm font-bold text-foreground mt-5 mb-2">Prerequisites</h3>
          <ul className="list-disc list-inside space-y-1">
            <li><strong className="text-foreground">Node.js</strong> ≥ 22</li>
            <li><strong className="text-foreground">pnpm</strong> ≥ 11</li>
            <li><strong className="text-foreground">PostgreSQL</strong> database (Neon, RDS, or任何 PostgreSQL-compatible service)</li>
          </ul>
          <h3 className="text-sm font-bold text-foreground mt-5 mb-2">Quick Setup</h3>
          {code(`git clone https://github.com/Mohamediibra7im/vaultify.git
cd vaultify
pnpm install
cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env with your database URL and JWT secret

cd apps/api
npx prisma generate
npx prisma migrate dev --name init
cd ../..

pnpm dev`)}
          <p className="mt-3">
            Frontend runs at {inlineCode("http://localhost:3000")}, API at {inlineCode("http://localhost:4000/api")}.
          </p>
        </>
      ),
    },
    {
      id: "security",
      title: "5. Encryption & Security",
      content: (
        <>
          <h3 className="text-sm font-bold text-foreground mb-2">AES-256-GCM Encryption</h3>
          <p>Every secret value is encrypted using AES-256-GCM before being stored. Each secret gets a unique, cryptographically random initialization vector (IV). The encrypted value and IV are stored together; the encryption key is derived from the server-side {inlineCode("JWT_SECRET")} environment variable.</p>
          {table(
            ["Layer", "Implementation"],
            [
              ["Encryption at rest", "AES-256-GCM with unique IV per secret value"],
              ["Password hashing", "bcrypt with configurable salt rounds"],
              ["Invite tokens", "Stored as cryptographic hashes — raw token never persisted"],
              ["RBAC enforcement", "Server-side role checks on every endpoint"],
              ["Secrets masking", "Values hidden by default in the dashboard; each reveal is audit-logged"],
              ["API token scoping", "Workspace-scoped with prefix-based identification"],
              ["Rate limiting", "Throttler on auth and sensitive endpoints"],
            ]
          )}
          <h3 className="text-sm font-bold text-foreground mt-5 mb-2">Click-to-Reveal</h3>
          <p>Secret values are never sent in plaintext during list operations. To view a value, you must explicitly reveal it — this decrypts the value server-side and creates an audit log entry.</p>
          <h3 className="text-sm font-bold text-foreground mt-5 mb-2">Per-Environment Access Control</h3>
          <p>Beyond workspace-level roles, Vaultify supports per-environment role overrides. A member with workspace-level VIEWER access can be granted EDITOR access to the development environment while remaining read-only for production.</p>
        </>
      ),
    },
    {
      id: "authentication",
      title: "6. Authentication & Integrations",
      content: (
        <>
          <h3 className="text-sm font-bold text-foreground mb-2">Sign-In Methods</h3>
          <p>Vaultify supports two authentication methods:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2 text-zinc-400">
            <li><strong className="text-foreground">Email & Password</strong> — Register with your email, password, and display name. Passwords are hashed with bcrypt.</li>
            <li><strong className="text-foreground">GitHub OAuth</strong> — One-click sign-in with your GitHub account. No additional password to remember.</li>
          </ul>

          <h3 className="text-sm font-bold text-foreground mt-5 mb-2">API Tokens</h3>
          <p>Generate workspace-scoped API tokens for CI/CD pipelines and automation. The raw token is shown only once at creation. Tokens are prefixed for easy identification.</p>
          {code(`# Generate a token
POST /api/workspaces/<workspace-id>/tokens
{ "name": "GitHub Actions CI" }

# Use it in your pipeline
curl -H "Authorization: Bearer vtk_abc123..." \\
  https://your-api.com/api/environments/<eid>/secrets/export`)}

          <h3 className="text-sm font-bold text-foreground mt-5 mb-2">CLI Tool</h3>
          <p>The Vaultify CLI lets you pull secrets and inject them directly into your application runtime. No {inlineCode(".env")} file is written to disk — secrets stay in process memory.</p>
          {code(`npm install -g @vaultify/cli
vaultify login
vaultify pull --env production > .env
vaultify run -- npm run dev`)}
        </>
      ),
    },
    {
      id: "audit-logs",
      title: "7. Audit Logs",
      content: (
        <>
          <p>Every significant action in Vaultify is logged to an immutable audit trail. Logs are scoped to workspaces and capture who did what, when, and to which resource.</p>
          {table(
            ["Action", "Description"],
            [
              ["workspace create / update / delete", "Workspace lifecycle events"],
              ["member add / remove / role change", "Member management"],
              ["project create / update / delete", "Project lifecycle"],
              ["environment create / delete", "Environment management"],
              ["secret create / update / delete", "Secret CRUD operations"],
              ["secret reveal", "Each time a secret value is decrypted and viewed"],
              ["invite create / revoke", "Invite link management"],
            ]
          )}
        </>
      ),
    },
    {
      id: "architecture",
      title: "8. Architecture",
      content: (
        <>
          <p>Vaultify is structured as a pnpm monorepo with these components:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2 text-zinc-400">
            <li><strong className="text-foreground">Web App</strong> — Next.js 16 dashboard and marketing site with Tailwind CSS 4 and shadcn/ui</li>
            <li><strong className="text-foreground">API</strong> — NestJS 11 REST API with Prisma ORM and PostgreSQL</li>
            <li><strong className="text-foreground">CLI</strong> — TypeScript command-line tool for CI/CD integration</li>
            <li><strong className="text-foreground">Shared Types</strong> — Common TypeScript types, DTOs, and enums shared across packages</li>
          </ul>
          <p className="mt-3">The tech stack includes Next.js 16, React 19, NestJS 11, Prisma 7, PostgreSQL, Passport.js with JWT, and bcrypt for password hashing.</p>
        </>
      ),
    },
  ];

  return (
    <LegalPageLayout
      title="Documentation"
      subtitle="Everything you need to know about Vaultify — how it works, how to set it up, and what makes it secure."
      lastUpdated="July 2026"
      sections={sections}
    />
  );
}
