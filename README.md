# SEO Dashboard

Full-stack **Next.js** application for SEO operations — projects, analytics, activities, leads, and reports.

## Quick start

```bash
cp .env.example .env.local   # set MONGODB_URI, APP_KEY
npm install
npm run seed                 # super admin + RBAC role seeds
npm run dev                  # http://localhost:3000
npm test
```

## Documentation

Internal docs live in **`doc/`** (local/agent use).

| Start | Path |
|-------|------|
| Agent hub | `doc/AGENTS.md` |
| Product modules (1–12) | `doc/modules/README.md` |
| RBAC model | `doc/rbac.md` |
| Migration tracker | `doc/migration.md` |

## Repo structure

- **`app/(auth)/`** — Sign in, register, password flows
- **`app/(dashboard)/`** — Authenticated app shell and modules
- **`app/api/v1/`** — REST API
- **`laravel-old/`** — Original Laravel API (**reference only** — reuse business rules, not implementation)

## Principles

1. **Product spec first** — `doc/modules/` and `doc/rbac.md` define behavior.
2. **Next.js-native** — App Router, route handlers, Mongoose, TanStack Query.
3. **Laravel as reference** — check `laravel-old/` for legacy rules when porting; do not copy company-centric patterns.
4. **Project-scoped RBAC** — permissions via `project_members` + role templates; `super_admin` on `User.roles` only.

## Status (summary)

| Layer | Status |
|-------|--------|
| Module 1 — Auth API + UI | ✅ |
| Module 6 — Access control (platform) | 🟡 |
| Modules 2–5, 7–11 | ⬜ / 🟡 placeholders |
| Module 12 — Profile + password | ✅ |

See `doc/migration.md` for the full tracker.
