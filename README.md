# SEO Dashboard

Full-stack **Next.js** application for SEO operations management — companies, projects, Google integrations, and sheet sync.

## Quick start

```bash
cp .env.example .env.local   # set MONGODB_URI, APP_KEY
npm install
npm run seed                 # super admin + RBAC
npm run dev                  # http://localhost:3000
npm test
```

## Documentation

Detailed internal docs live in **`doc/`** (gitignored — local/agent use only).

Quick reference:

- **API:** `app/api/v1/*` — JSON envelope `{ success, message, data }`
- **Auth API:** login, register-company, forgot/reset password, Bearer tokens
- **UI:** `app/(auth)/` sign-in flows · `app/(dashboard)/` (in progress)
- **References:** `laravel-old/` (Laravel API) · `old-next-frontend/` (old React UI)

## Repo structure

- **`app/(auth)/`** — Sign in, register, password flows
- **`app/(dashboard)/`** — Authenticated app (in progress)
- **`app/api/v1/`** — REST API
- **`laravel-old/`** — Original Laravel API (reference)
- **`old-next-frontend/`** — Original Vite React UI (reference)

## Status (summary)

| Layer | Status |
|-------|--------|
| API auth + tests | ✅ |
| Auth UI screens | ✅ (API wiring pending) |
| Dashboard UI | Scaffold only |
| Remaining API modules | Not started |

See `doc/migration.md` locally for the full tracker.
