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
      id: "overview",
      title: "1. Overview",
      content: (
        <>
          <p>
            Vaultify is an open-source secrets management platform for development teams. It provides a structured hierarchy — <strong className="text-foreground">Workspace → Project → Environment → Secrets</strong> — with AES-256-GCM encryption at rest, granular role-based access control, real-time sync, and a full audit trail.
          </p>
          <p className="mt-3">
            Instead of sharing {inlineCode(".env")} files over Slack or email, your team stores secrets in Vaultify where they&apos;re encrypted, version-tracked, and access-controlled. Pull them into your app via the dashboard, REST API, or CLI.
          </p>
          <h3 className="text-sm font-bold text-foreground mt-5 mb-2">Core Concepts</h3>
          {table(
            ["Concept", "Description"],
            [
              ["Workspace", "Top-level container for a team or organization. Has members with roles."],
              ["Project", "A service or application within a workspace (e.g. 'backend-api')."],
              ["Environment", "A deployment stage within a project (e.g. development, staging, production)."],
              ["Secret", "A key-value pair encrypted with AES-256-GCM. Stored per environment."],
            ]
          )}
        </>
      ),
    },
    {
      id: "quickstart",
      title: "2. Quickstart",
      content: (
        <>
          <h3 className="text-sm font-bold text-foreground mb-2">Prerequisites</h3>
          <ul className="list-disc list-inside space-y-1">
            <li><strong className="text-foreground">Node.js</strong> ≥ 22</li>
            <li><strong className="text-foreground">pnpm</strong> ≥ 9</li>
            <li><strong className="text-foreground">Docker</strong> (for Redis)</li>
            <li><strong className="text-foreground">Neon account</strong> — free at <a href="https://neon.tech" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">neon.tech</a></li>
          </ul>
          <h3 className="text-sm font-bold text-foreground mt-5 mb-2">Setup</h3>
          {code(`git clone https://github.com/Mohamediibra7im/vaultify.git
cd vaultify
pnpm install

# Start Redis
docker compose up -d

# Configure environment
cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env with your Neon credentials and JWT secret

# Initialize database
cd apps/api
npx prisma generate
npx prisma migrate dev --name init
cd ../..

# Launch both apps
pnpm dev`)}
          <p className="mt-3">
            Frontend runs at {inlineCode("http://localhost:3000")}, API at {inlineCode("http://localhost:4000/api")}.
          </p>
        </>
      ),
    },
    {
      id: "authentication",
      title: "3. Authentication",
      content: (
        <>
          <p>Vaultify supports two authentication methods:</p>
          <h3 className="text-sm font-bold text-foreground mt-4 mb-2">Email & Password</h3>
          <p>Register with email, password, and display name. Passwords are hashed with bcrypt.</p>
          {code(`POST /api/auth/register
{
  "email": "dev@example.com",
  "password": "SecurePass123!",
  "name": "Jane Developer"
}

POST /api/auth/login
{
  "email": "dev@example.com",
  "password": "SecurePass123!"
}
→ Returns: { "token": "eyJhbG...", "user": { ... } }`)}
          <h3 className="text-sm font-bold text-foreground mt-5 mb-2">GitHub OAuth</h3>
          <p>One-click sign-in via GitHub. Navigate to {inlineCode("GET /api/auth/github")} to start the OAuth flow. After authorization, the callback at {inlineCode("/api/auth/github/callback")} creates or links the account and returns a JWT.</p>
          <h3 className="text-sm font-bold text-foreground mt-5 mb-2">Using Your Token</h3>
          <p>Include the JWT in every authenticated request:</p>
          {code(`Authorization: Bearer <your-jwt-token>`)}
        </>
      ),
    },
    {
      id: "workspaces",
      title: "4. Workspaces",
      content: (
        <>
          <p>A workspace is the top-level container for your team. The creator becomes the <strong className="text-foreground">OWNER</strong>.</p>
          {table(
            ["Method", "Endpoint", "Description"],
            [
              ["POST", "/api/workspaces", "Create a new workspace"],
              ["GET", "/api/workspaces", "List all workspaces you belong to"],
              ["GET", "/api/workspaces/:id", "Get workspace with members & projects"],
              ["PATCH", "/api/workspaces/:id", "Update workspace name (owner only)"],
              ["DELETE", "/api/workspaces/:id", "Delete workspace and all data (owner only)"],
            ]
          )}
          <h3 className="text-sm font-bold text-foreground mt-5 mb-2">Members & Roles</h3>
          {table(
            ["Role", "Permissions"],
            [
              ["OWNER", "Full access. Manage members, roles, invite links, delete workspace."],
              ["EDITOR", "Create/edit/delete projects, environments, and secrets."],
              ["VIEWER", "Read-only. Can view secrets (with reveal) but cannot modify anything."],
            ]
          )}
          {table(
            ["Method", "Endpoint", "Description"],
            [
              ["GET", "/api/workspaces/:id/members", "List all members"],
              ["PATCH", "/api/workspaces/:id/members/:mid/role", "Change a member's role"],
              ["DELETE", "/api/workspaces/:id/members/:mid", "Remove a member"],
            ]
          )}
        </>
      ),
    },
    {
      id: "invite-links",
      title: "5. Invite Links",
      content: (
        <>
          <p>Workspace owners can generate invite links to onboard new members. Tokens are stored as cryptographic hashes — the raw link is shown only once at creation time.</p>
          {table(
            ["Method", "Endpoint", "Description"],
            [
              ["POST", "/api/workspaces/:wid/invite-link", "Generate a single-use invite link"],
              ["POST", "/api/workspaces/:wid/invite-links", "Create invite with role/email/max-uses options"],
              ["GET", "/api/workspaces/:wid/invite-links", "List all invite links"],
              ["POST", "/api/workspaces/:wid/invite-links/:id/revoke", "Revoke an invite link"],
              ["GET", "/api/invite/:token", "Validate invite & preview workspace"],
              ["POST", "/api/invite/:token/accept", "Accept invite and join workspace"],
            ]
          )}
          {code(`POST /api/workspaces/<workspace-id>/invite-link
→ { "url": "https://vaultify.app/invite/abc123..." }

POST /api/invite/abc123.../accept
→ { "workspace": { "id": "...", "name": "My Team" }, "role": "EDITOR" }`)}
        </>
      ),
    },
    {
      id: "projects",
      title: "6. Projects",
      content: (
        <>
          <p>Projects represent applications or services within a workspace. Each project contains one or more environments.</p>
          {table(
            ["Method", "Endpoint", "Description"],
            [
              ["POST", "/api/workspaces/:wid/projects", "Create a project in a workspace"],
              ["GET", "/api/workspaces/:wid/projects", "List projects in a workspace"],
              ["GET", "/api/projects/:id", "Get project with its environments"],
              ["PATCH", "/api/projects/:id", "Update project name and/or description"],
              ["DELETE", "/api/projects/:id", "Delete project and all environments/secrets"],
            ]
          )}
          {code(`PATCH /api/projects/<project-id>
{
  "name": "backend-api",
  "description": "Main REST API service"
}`)}
        </>
      ),
    },
    {
      id: "environments",
      title: "7. Environments",
      content: (
        <>
          <p>Environments represent deployment stages. Each environment has its own isolated set of secrets. Environment names are unique within a project.</p>
          {table(
            ["Method", "Endpoint", "Description"],
            [
              ["POST", "/api/projects/:pid/environments", "Create an environment"],
              ["GET", "/api/projects/:pid/environments", "List environments in a project"],
              ["GET", "/api/environments/:id", "Get environment details"],
              ["DELETE", "/api/environments/:id", "Delete environment and all secrets"],
              ["GET", "/api/projects/:pid/environments/diff?id1=X&id2=Y", "Compare secrets across two environments"],
            ]
          )}
          <h3 className="text-sm font-bold text-foreground mt-5 mb-2">Environment Diff</h3>
          <p>Compare secrets between two environments to catch configuration drift. Optionally include decrypted values in the comparison:</p>
          {code(`GET /api/projects/<pid>/environments/diff?id1=<env1>&id2=<env2>&includeValues=true
→ {
    "onlyInA": [{ "key": "STRIPE_KEY", "value": "sk_test_..." }],
    "onlyInB": [{ "key": "NEW_FEATURE_FLAG", "value": "true" }],
    "common": [{ "key": "DB_HOST", "same": false, "valueA": "dev.db", "valueB": "prod.db" }]
  }`)}
        </>
      ),
    },
    {
      id: "secrets",
      title: "8. Secrets Management",
      content: (
        <>
          <p>Secrets are key-value pairs encrypted with <strong className="text-foreground">AES-256-GCM</strong>. Each secret has a unique initialization vector (IV) and maintains a full version history.</p>
          {table(
            ["Method", "Endpoint", "Description"],
            [
              ["GET", "/api/environments/:eid/secrets", "List secrets (values masked)"],
              ["POST", "/api/environments/:eid/secrets", "Create a new secret"],
              ["GET", "/api/secrets/:id", "Get a single secret"],
              ["PATCH", "/api/secrets/:id", "Update secret key or value"],
              ["DELETE", "/api/secrets/:id", "Delete a secret"],
              ["POST", "/api/secrets/:id/reveal", "Decrypt and reveal value (audit-logged)"],
              ["GET", "/api/secrets/:id/history", "Get version history"],
              ["POST", "/api/secrets/:id/rollback", "Rollback to a previous version"],
            ]
          )}
          <h3 className="text-sm font-bold text-foreground mt-5 mb-2">.env Import / Export</h3>
          {table(
            ["Method", "Endpoint", "Description"],
            [
              ["POST", "/api/environments/:eid/secrets/import", "Bulk import from .env format"],
              ["GET", "/api/environments/:eid/secrets/export", "Export all secrets as .env file"],
            ]
          )}
          {code(`# Import: paste .env content in the request body
POST /api/environments/<eid>/secrets/import
{ "envContent": "DATABASE_URL=postgres://...\\nREDIS_URL=redis://..." }

# Export: returns plaintext .env format
GET /api/environments/<eid>/secrets/export
→ DATABASE_URL=postgres://...
  REDIS_URL=redis://...`)}
        </>
      ),
    },
    {
      id: "encryption",
      title: "9. Encryption & Security",
      content: (
        <>
          <h3 className="text-sm font-bold text-foreground mb-2">AES-256-GCM Encryption</h3>
          <p>Every secret value is encrypted using AES-256-GCM before being stored. Each secret gets a unique, cryptographically random initialization vector (IV). The encrypted value and IV are stored together; the encryption key is derived from the server-side {inlineCode("JWT_SECRET")} environment variable.</p>
          {table(
            ["Security Layer", "Implementation"],
            [
              ["Encryption at rest", "AES-256-GCM with unique IV per secret"],
              ["Password hashing", "bcrypt with configurable salt rounds"],
              ["Invite tokens", "Stored as SHA-256 hashes — raw token never persisted"],
              ["RBAC enforcement", "Server-side role checks on every API endpoint"],
              ["Secrets masking", "Values hidden by default; each reveal is audit-logged"],
              ["API token scoping", "Workspace-scoped with prefix-based identification"],
              ["Rate limiting", "Throttler on auth and sensitive endpoints"],
            ]
          )}
          <h3 className="text-sm font-bold text-foreground mt-5 mb-2">Click-to-Reveal</h3>
          <p>Secret values are never sent in plaintext during list operations. To view a value, you must explicitly call the reveal endpoint, which decrypts the value server-side and creates an audit log entry.</p>
        </>
      ),
    },
    {
      id: "environment-access",
      title: "10. Per-Environment Access Control",
      content: (
        <>
          <p>Beyond workspace-level roles, Vaultify supports <strong className="text-foreground">per-environment role overrides</strong>. This allows an OWNER to grant a member elevated or restricted access to specific environments.</p>
          <p className="mt-2">For example, a member with workspace role VIEWER could be granted EDITOR access specifically to the development environment, while remaining read-only for production.</p>
          {table(
            ["Method", "Endpoint", "Description"],
            [
              ["GET", "/api/workspaces/:wid/members/:mid/environments", "List a member's environment overrides"],
              ["PUT", "/api/workspaces/:wid/members/:mid/environments/:eid", "Grant or update environment access"],
              ["DELETE", "/api/workspaces/:wid/members/:mid/environments/:eid", "Revoke environment override"],
            ]
          )}
          {code(`# Grant EDITOR access to a specific environment
PUT /api/workspaces/<wid>/members/<mid>/environments/<eid>
{ "role": "EDITOR" }

# Revoke the override (member falls back to workspace role)
DELETE /api/workspaces/<wid>/members/<mid>/environments/<eid>`)}
        </>
      ),
    },
    {
      id: "audit-logs",
      title: "11. Audit Logs",
      content: (
        <>
          <p>Every significant action in Vaultify is logged to an immutable audit trail. Audit logs are scoped to workspaces and capture who did what, when, and to which resource.</p>
          {table(
            ["Method", "Endpoint", "Description"],
            [["GET", "/api/workspaces/:id/audit-logs", "List all audit logs for a workspace"]],
          )}
          <h3 className="text-sm font-bold text-foreground mt-5 mb-2">Tracked Actions</h3>
          {table(
            ["Action", "Description"],
            [
              ["workspace.create / update / delete", "Workspace lifecycle events"],
              ["member.add / remove / role", "Member management changes"],
              ["project.create / update / delete", "Project lifecycle events"],
              ["environment.create / delete", "Environment management"],
              ["secret.create / update / delete", "Secret CRUD operations"],
              ["secret.reveal", "Each time a secret value is decrypted"],
              ["invite.create / revoke", "Invite link management"],
            ]
          )}
        </>
      ),
    },
    {
      id: "api-tokens",
      title: "12. API Tokens",
      content: (
        <>
          <p>API tokens allow headless access for CI/CD pipelines and automation scripts. Tokens are scoped to a workspace and the raw token value is shown only once at creation.</p>
          {table(
            ["Method", "Endpoint", "Description"],
            [
              ["POST", "/api/workspaces/:wid/tokens", "Create a new API token"],
              ["GET", "/api/workspaces/:wid/tokens", "List tokens for a workspace"],
              ["DELETE", "/api/workspaces/:wid/tokens/:id", "Revoke a token"],
            ]
          )}
          {code(`# Create a token for CI/CD
POST /api/workspaces/<wid>/tokens
{ "name": "GitHub Actions CI" }
→ { "id": "...", "rawToken": "vtk_abc123...", "name": "GitHub Actions CI" }

# Use in CI pipeline
curl -H "Authorization: Bearer vtk_abc123..." \\
  https://your-api.com/api/environments/<eid>/secrets/export`)}
        </>
      ),
    },
    {
      id: "notifications",
      title: "13. Notifications",
      content: (
        <>
          <p>Vaultify provides in-app notifications for important events like being added to a workspace, role changes, and secret modifications. Notifications are delivered in real-time via WebSocket.</p>
          {table(
            ["Method", "Endpoint", "Description"],
            [
              ["GET", "/api/notifications", "List your notifications"],
              ["GET", "/api/notifications/unread-count", "Get unread notification count"],
              ["POST", "/api/notifications/:id/read", "Mark a notification as read"],
              ["POST", "/api/notifications/read-all", "Mark all notifications as read"],
            ]
          )}
        </>
      ),
    },
    {
      id: "realtime",
      title: "14. Real-Time Sync",
      content: (
        <>
          <p>Vaultify uses <strong className="text-foreground">Socket.IO</strong> for real-time updates. When a team member creates, updates, or deletes a secret, all connected clients subscribed to that workspace receive the change instantly.</p>
          <h3 className="text-sm font-bold text-foreground mt-4 mb-2">WebSocket Events</h3>
          {table(
            ["Event", "Payload", "Trigger"],
            [
              ["workspace:changed", "{ id, name }", "Workspace updated"],
              ["workspace:deleted", "{ id }", "Workspace deleted"],
              ["project:changed", "{ id, name, workspaceId }", "Project created/updated"],
              ["project:deleted", "{ id, workspaceId }", "Project deleted"],
              ["member:changed", "{ memberId, role }", "Member role updated"],
              ["member:removed", "{ memberId }", "Member removed"],
              ["audit:new", "{ ... }", "New audit log entry"],
            ]
          )}
          <p className="mt-3">Connect to the WebSocket server at {inlineCode("ws://localhost:4000")} with your JWT token for authentication.</p>
        </>
      ),
    },
    {
      id: "cli",
      title: "15. CLI Tool (Planned)",
      content: (
        <>
          <p>The Vaultify CLI will be the primary tool for pulling and injecting secrets into your application runtime. Here&apos;s a preview of the planned interface:</p>
          {code(`# Install globally
npm install -g @vaultify/cli

# Authenticate with your account
vaultify login

# Link your project directory
vaultify init

# Pull secrets as .env file
vaultify pull --env production > .env

# Run your app with injected secrets (no .env file written)
vaultify run -- npm run dev

# Compare environments
vaultify diff development production`)}
          <p className="mt-3 text-amber-400/80 text-[10px] font-mono">⚠ The CLI is currently under development and not yet available.</p>
        </>
      ),
    },
    {
      id: "environment-variables",
      title: "16. Configuration Reference",
      content: (
        <>
          <p>Required environment variables for the API server ({inlineCode("apps/api/.env")}):</p>
          {table(
            ["Variable", "Required", "Description"],
            [
              ["DATABASE_URL", "✅", "Pooled Neon PostgreSQL connection string (runtime)"],
              ["DIRECT_URL", "✅", "Unpooled Neon connection string (migrations only)"],
              ["REDIS_URL", "✅", "Redis connection — redis://localhost:6379 for local"],
              ["JWT_SECRET", "✅", "32-byte random base64 key for JWT signing + encryption"],
              ["PORT", "—", "API server port (default: 4000)"],
              ["FRONTEND_URL", "—", "CORS origin (default: http://localhost:3000)"],
              ["GITHUB_CLIENT_ID", "—", "GitHub OAuth application client ID"],
              ["GITHUB_CLIENT_SECRET", "—", "GitHub OAuth application client secret"],
            ]
          )}
          {code(`# Generate a secure JWT secret
openssl rand -base64 32`)}
        </>
      ),
    },
  ];

  return (
    <LegalPageLayout
      title="Documentation"
      subtitle="Complete reference for the Vaultify platform — architecture, API endpoints, security model, and integration guides."
      lastUpdated="July 3, 2026"
      sections={sections}
    />
  );
}
