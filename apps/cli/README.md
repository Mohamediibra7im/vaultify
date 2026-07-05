# @vaultiify/cli

**vlt-cli** — manage secrets from your terminal, interactively.

## Install

```bash
npm install -g @vaultiify/cli
```

## Quick Start

Just run `vlt-cli` — no arguments needed:

```bash
vlt-cli
```

You'll get an interactive menu where you can navigate with arrow keys:

```
  ╭─────────────────────────────╮
  │  vlt-cli · Vaultify CLI     │
  ╰─────────────────────────────╯

❯ What would you like to do?
  📁  Init (link project)
  🚀  Pull secrets
  🚀  Push secrets
  ▶   Run with secrets
  📁  Browse
  ⇄   Compare environments
  🛡️  Secrets
  👥  Members
  🔑  API Tokens
  👤  Who am I?
  ↩   Logout
```

Every command guides you through selection — **no need to remember or type workspace slugs, environment names, or project IDs**.

## Commands

You can also jump directly to a command:

```bash
vlt-cli login       # Authenticate
vlt-cli init        # Link this directory to a project
vlt-cli pull        # Export secrets as .env
vlt-cli push        # Import .env into an environment
vlt-cli run -- npm start   # Run with injected secrets
vlt-cli ls          # Browse workspaces, projects, secrets
vlt-cli diff        # Compare two environments
vlt-cli members     # List workspace members
vlt-cli tokens      # Manage API tokens
vlt-cli secrets     # Search & reveal secrets
vlt-cli whoami      # Show current session
vlt-cli logout      # Clear credentials
vlt-cli --help      # Show help
```

## Workflows

### Login

```bash
vlt-cli login
```

Choose between:
- **Email & Password** — sign in with your Vaultify account
- **API Token** — paste a token from the dashboard (for OAuth users or CI/CD)

### Init (Link a Project)

```bash
vlt-cli init
```

Links the current directory to a workspace/project/environment. Creates a `.vaultify.json` file so `pull`, `push`, and `run` auto-detect your context.

> **Tip:** Add `.vaultify.json` to your `.gitignore`.

### Pull Secrets

```bash
vlt-cli pull
```

1. Select workspace → project → environment (or auto-detected from `.vaultify.json`)
2. Choose whether to resolve references
3. Enter output filename (default: `<env>.env`)

### Push Secrets

```bash
vlt-cli push
```

1. Select workspace → project → environment
2. Enter path to `.env` file (default: `.env`)
3. Confirm the import

### Run with Secrets

```bash
vlt-cli run -- npm start
vlt-cli run -- node server.js
vlt-cli run -- python app.py
```

Fetches secrets from Vaultify and injects them as environment variables into any command. If you've run `vlt-cli init`, it uses the linked environment automatically.

### Browse

```bash
vlt-cli ls
```

Choose what to list: workspaces, projects, or secrets.

### Compare Environments

```bash
vlt-cli diff
```

Pick two environments and see what's different.

## Backward Compatibility

The `vaultify` command still works as an alias for `vlt-cli`.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VAULTIFY_TOKEN` | API token (overrides saved token) |
| `VAULTIFY_API_URL` | API base URL (overrides saved URL) |

## Configuration

- Global credentials: `~/.vaultify/config.json`
- Project link: `.vaultify.json` (created by `vlt-cli init`)
