# @vaultify/web

Vaultify frontend — Next.js 16 dashboard and marketing site.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **UI:** React 19, Tailwind CSS 4, shadcn/ui + Radix UI
- **Animation:** Motion (Framer Motion) v12
- **State:** React Context (`useAuth`)
- **Real-time:** Socket.IO Client
- **Theme:** Dark cyberpunk — glassmorphism, emerald accents, monospace labels

## Getting Started

```bash
# From repo root
pnpm install
pnpm --filter @vaultify/web dev
```

Frontend runs at `http://localhost:3000`. Requires API at `http://localhost:4000`.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | Backend API URL (default: `http://localhost:4000/api`) |

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/          # Authenticated dashboard
│   │   ├── components/     # Dashboard-specific components
│   │   ├── projects/       # Project management
│   │   ├── settings/       # Workspace & account settings
│   │   └── workspaces/     # Workspace management
│   ├── contact/            # Contact form
│   ├── login/              # Auth pages
│   ├── register/
│   ├── security/           # Security info page
│   └── (marketing)/        # Landing, features, docs, etc.
├── components/
│   ├── landing/            # Navbar, Footer, Hero
│   └── ui/                 # shadcn/ui primitives
├── lib/
│   ├── api.ts              # HTTP client (api.get/api.post)
│   ├── auth-context.ts     # Auth provider + useAuth hook
│   └── utils.ts            # cn() helper
└── test/                   # Vitest tests
```

## Build

```bash
pnpm --filter @vaultify/web build
```

## License

MIT
