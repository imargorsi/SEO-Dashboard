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

| Start | Path |
|-------|------|
| Agent hub | `doc/AGENTS.md` |
| Product modules (1–12) | `doc/modules/README.md` |
| Migration tracker | `doc/migration.md` |

Quick reference:

- **API:** `app/api/v1/*` — JSON envelope `{ success, message, data }`
- **Module 1 (Auth):** login, register, forgot/reset, Bearer tokens — `doc/modules/01-authentication.md`
- **UI:** `app/(auth)/` · `app/(dashboard)/` — `doc/frontend.md`
- **References:** `laravel-old/` · `old-next-frontend/`

## Repo structure

- **`app/(auth)/`** — Sign in, register, password flows
- **`app/(dashboard)/`** — Authenticated app (in progress)
- **`app/api/v1/`** — REST API
- **`laravel-old/`** — Original Laravel API (reference)
- **`old-next-frontend/`** — Original Vite React UI (reference)

## Status (summary)

| Layer | Status |
|-------|--------|
| Module 1 — Auth API + UI | ✅ |
| Modules 2–11 | ⬜ |
| Dashboard shell + admin UI (dummy data) | 🟡 |

See `doc/migration.md` and `doc/modules/README.md` for the full tracker.
