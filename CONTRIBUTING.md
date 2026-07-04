# Contributing to Vaultify

Thanks for your interest in contributing. This guide covers setup, workflow, and standards.

## Prerequisites

- **Node.js** ≥ 22
- **pnpm** ≥ 11
- **Docker** — for local Redis
- **Neon account** — free tier at [neon.tech](https://neon.tech)

## Setup

```bash
# Fork and clone
git clone https://github.com/<your-username>/vaultify.git
cd vaultify

# Install dependencies
pnpm install

# Start Redis
docker compose up -d

# Configure environment
cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env with your credentials

# Initialize database
cd apps/api
npx prisma generate
npx prisma migrate dev --name init
cd ../..

# Start dev servers
pnpm dev
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| API | http://localhost:4000/api |

## Branching

- `main` — production-ready code
- `feat/*` — new features
- `fix/*` — bug fixes
- `chore/*` — maintenance, deps, config

```bash
git checkout -b feat/your-feature
```

## Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>: <description>

[optional body]
```

**Types:**
| Type | Use for |
|------|---------|
| `feat` | New feature |
| `fix` | Bug fix |
| `chore` | Deps, config, tooling |
| `docs` | Documentation only |
| `refactor` | Code change that neither fixes nor adds |
| `test` | Adding or updating tests |
| `style` | Formatting, whitespace, semicolons |

**Examples:**
```
feat: add workspace invitation via email
fix: prevent revoked tokens from appearing in dashboard
chore: update Prisma to 7.8.0
```

## Project Structure

```
vaultify/
├── apps/
│   ├── web/          Next.js 16 frontend
│   ├── api/          NestJS 11 backend
│   └── cli/          TypeScript CLI
├── packages/
│   └── shared-types/ Shared DTOs & enums
└── docs/             Documentation
```

## Development Workflow

### Running Locally

```bash
pnpm dev              # Start all services
pnpm build            # Production build
pnpm lint             # Lint all packages
```

### Frontend

```bash
pnpm --filter @vaultify/web dev
pnpm --filter @vaultify/web build
```

### Backend

```bash
pnpm --filter @vaultify/api dev
pnpm --filter @vaultify/api build
pnpm --filter @vaultify/api prisma:generate
pnpm --filter @vaultify/api prisma:migrate
```

### Database Changes

After modifying `apps/api/prisma/schema.prisma`:

```bash
cd apps/api
npx prisma migrate dev --name descriptive_name
```

Always include migration files in your commit.

## Code Standards

- **TypeScript** — strict mode, no `any`
- **Imports** — use `@/` path aliases in frontend, relative imports in backend
- **Components** — React functional components with hooks
- **API calls** — use `api.get()` / `api.post()` from `@/lib/api`, never raw `fetch`
- **Auth** — always use `useAuth()` for tokens, never hardcode
- **Styling** — Tailwind CSS, `cn()` helper for class merging
- **Naming** — PascalCase components, camelCase functions/variables, kebab-case files

## Pull Request Process

1. **Update documentation** if your change affects user-facing behavior
2. **Ensure builds pass** — `pnpm build` should complete without errors
3. **Write descriptive PR title** — matches commit convention
4. **Fill PR description** — what changed, why, how to test
5. **Link related issues** — reference with `Closes #123`

### PR Checklist

- [ ] Code compiles (`pnpm build`)
- [ ] No new TypeScript errors
- [ ] Migration included (if schema changed)
- [ ] Documentation updated (if applicable)
- [ ] Commits follow Conventional Commits

## Reporting Issues

Open an issue with:
- **Clear title** — what's broken or suggested
- **Steps to reproduce** — for bugs
- **Expected vs actual behavior**
- **Environment** — OS, Node version, browser

## License

By contributing, you agree your contributions are licensed under the MIT License.