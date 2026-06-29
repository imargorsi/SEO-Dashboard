<?php

namespace App\OpenApi;

use OpenApi\Attributes as OA;

/**
 * Root OpenAPI metadata (scanned by l5-swagger; this class is not referenced at runtime).
 */
#[OA\Info(
    version: '1.0.0',
    title: 'Seo Dashboard API',
    description: <<<'MD'
HTTP API for Seo Dashboard (React SPA + Laravel JSON).

**Authenticated requests (Swagger UI)**  
1. Expand **Auth** → **POST /api/v1/auth/login** → Execute with super admin `email` / `password`.  
2. Copy `data.token` from the response (the long string only).  
3. Click the green **Authorize** button at the top of this page → choose **sanctum (http, Bearer)** → paste the token → Authorize.  
   Swagger sends `Authorization: Bearer …` on later calls (including **POST /api/v1/admin/companies**).

**Do not** type the word `Bearer` yourself unless the dialog asks for the full header value.

**RBAC** — use the **Roles** and **Permissions** sections for Spatie role/permission CRUD (still requires `super_admin`).

**Password reset** — `POST /api/v1/auth/forgot-password` then `POST /api/v1/auth/reset-password` with `token` and `email` from the link (`FRONTEND_URL/reset-password?...`).

**Company self-registration** — `POST /api/v1/auth/register-company` (same fields as admin create plus `password`). Status is **pending** until **POST /api/v1/admin/companies/{id}/approve**.

**Regenerate this spec (no SSH / terminal)** — after deploy, open `{APP_URL}/regenerate-swagger.php` in the browser, then hard-refresh this page (Ctrl+F5). The JSON is written to `storage/api-docs/api-docs.json` on the server.
MD,
)]
#[OA\Server(
    url: '/',
    description: 'Same host as this app (e.g. your Laragon vhost).',
)]
#[OA\Tag(
    name: 'Auth',
    description: <<<'MD'
Public and session endpoints: **login**, **logout**, **register-company**, password reset, current user.

- **POST** `/api/v1/auth/login` — returns Bearer token.
- **POST** `/api/v1/auth/register-company` — same company fields as admin create plus `password`; creates `status: pending` (no token).
- Pending registrations cannot log in until an admin calls **POST** `/api/v1/admin/companies/{id}/approve`.
MD,
)]
#[OA\Tag(
    name: 'Admin',
    description: <<<'MD'
**super_admin** company management (`/api/v1/admin/companies`).

- **GET** — list all companies (optional `?status=pending` for new self-registrations; omit `status` for full list — backward compatible).
- **POST** — admin create (immediate `approved` + welcome email with generated password; same request body as before).
- **POST** `/{id}/approve` — activate a pending self-registration.
- **GET/PATCH/DELETE** `/{id}` — unchanged CRUD.

Company responses include **`status`** (`pending` | `approved` | `rejected`) in addition to **`is_active`**.
MD,
)]
#[OA\Tag(
    name: 'Roles',
    description: 'Manage Spatie roles and their permission assignments. Requires **super_admin** and a Bearer token from **Auth → login**.',
)]
#[OA\Tag(
    name: 'Permissions',
    description: 'Manage Spatie permission records (dot-notation names). Requires **super_admin** and a Bearer token from **Auth → login**.',
)]
#[OA\Tag(
    name: 'Projects',
    description: <<<'MD'
Single CRUD for SEO **project** intake (`/api/v1/projects`). Requires **super_admin** or **company_admin** (active company).

- **super_admin** — all projects; send `company_id` on create; optional **`GET ?company_id=`** on index to filter by tenant; omit for all companies.
- **company_admin** — own company only; do not send `company_id` on create or index (422 if sent on index).
- List responses include **`data.filters.company_id`** when scoped to one company.

CMS password is write-only; responses expose `cms_password_set` only. Dropdown values: **Lookups** (`/api/v1/lookups/industry-niches`, `/api/v1/lookups/seo-goals`).
MD,
)]
#[OA\Tag(
    name: 'Integrations',
    description: <<<'MD'
Connect third-party accounts to a **project** via OAuth. Implementation lives under `app/Integrations/{Provider}/` (Google first).

**Google** — `POST …/integrations/google/connect` returns `auth_url`; redirect the user there. After consent, Google hits `GET /api/v1/integrations/google/callback` (public), then the user returns to the SPA at `{FRONTEND_URL}{GOOGLE_OAUTH_FRONTEND_CALLBACK_PATH}` (default `/projects/new`) with `success`, `project_id`, etc. Tokens are stored server-side (never exposed to the frontend). Use `GET …/integrations` to show connection status.

Services: `analytics`, `search_console`, `tag_manager`, `ads`.
MD,
)]
#[OA\Tag(
    name: 'Project Sheets',
    description: <<<'MD'
Import SEO activity rows from a **shared master Google Spreadsheet** into the platform. Separate from Google OAuth integrations (`app/Sheets/`).

**Types** — `bp` (Blog Posting), `gp` (Guest Posting), `sp` (Service Page), `kc` (Key Change).

**super_admin**
1. **PUT** `/api/v1/admin/sheets/{type}` — configure the master spreadsheet tab.
2. **POST** `/api/v1/admin/sheets/{type}/sync` — import **all rows**; each row's `Site` column maps to `projects.site_code`.
3. **GET** `/api/v1/admin/sheets/{type}/entries` — list **all imported rows** across every project (optional `?project_id=`, `?company_id=`, `?site=`).

**company_admin / super_admin (read per project)**
- **GET** `/api/v1/projects/{project}/sheets/{type}/entries` — paginated rows for that project only.
MD,
)]
#[OA\Tag(
    name: 'Profile',
    description: <<<'MD'
Signed-in user account. Requires a Bearer token from **Auth → login**.

- **GET** `/api/v1/me/profile` — read profile (includes `profile_image` URL or null).
- **POST** `/api/v1/me/profile` — update `name`, upload/remove `profile_image` (JSON or multipart; email cannot be changed). Replaces PATCH (same URL; use POST only).
- **DELETE** `/api/v1/me/profile` — delete account (password required).
- **PUT** `/api/v1/me/password` — change password.
MD,
)]
class Documentation {}
