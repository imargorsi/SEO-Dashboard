# Crawllex Lead Capture (WordPress)

WordPress plugin for pushing form submissions into Crawllex. Lives in this repo at `plugin/`.

Copy this folder into `wp-content/plugins/crawllex-lead-capture/` (keep the inner files; the folder name on the WordPress site should be the plugin slug).

## Current slice

- Settings → Crawllex Lead Capture
- **Dashboard Base URL** + **Lead Source Key**
- **Test Connection** → `POST /api/v1/leads/ingest/verify`
- Plugin-local status, ingest/failed counts, last 20 events
- **Contact Form 7** → `POST /api/v1/leads/ingest` after a successful (or skipped-mail) submit
- WPForms, Gravity Forms, Fluent Forms, and Elementor Forms are not wired yet

## Setup

1. In Crawllex: project **Active** → Settings → Integrations → Connect WordPress → copy the key once.
2. In WordPress: paste the dashboard origin and the `clx_ls_…` key.
3. Click **Test Connection**. The stored key is not shown again in the form; the page only displays the last four characters.
4. Use a Contact Form 7 form with first name, email, phone, and message (see tags below). Submit it and confirm the lead in Crawllex `/leads`. Plugin logs show success or the API message.

| Where WordPress runs | Dashboard Base URL |
|----------------------|--------------------|
| Same Windows/Mac computer (XAMPP, Local, etc.) | `http://127.0.0.1:3000` (not `localhost` — PHP often uses IPv6) |
| Docker / DevKinsta / similar | `http://host.docker.internal:3000` (run Next with `-H 0.0.0.0`) |
| Hosted / remote server | Public Crawllex URL (`https://your-app.example.com` or a Vercel preview). `localhost` is the WordPress server, not your laptop. |

Do not use a dashboard user password or access token. Auth is the Lead Source Key only (`X-Lead-Source-Key`).

## Contact Form 7

The visitor-facing form is never blocked if Crawllex ingest fails. Spam and validation failures are skipped. Mail failures and CF7 demo/skip-mail still ingest.

Default CF7 tags map automatically (`your-name`, `your-email`, `your-message`). Add a phone field — Crawllex requires it.

```
[text* your-name]
[email* your-email]
[tel* your-phone]
[textarea* your-message]
```

Optional: `[text your-last-name]`, a services field (`your-service` / `services`), leftover tags go to `extras`.

Idempotency uses `cf7-{formId}-{postedHash}` so retries do not create duplicate rows.
