import { env } from "@/lib/config/env";
import { escapeAttribute, escapeHtml } from "@/lib/mail/templates/escape";
import type { TMailLayoutInput } from "@/lib/mail/templates/types";

/**
 * Fixed hex values mirrored from the default theme pack in `app/globals.css`.
 * Email clients do not support CSS variables — keep this palette in sync manually.
 */
const mailTheme = {
  bgMain: "#eeeaf4",
  bgCard: "#ffffff",
  textPrimary: "#1a1628",
  textSecondary: "#5c5670",
  textMuted: "#8a8499",
  border: "#e4e0eb",
  brand: "#ff7952",
  textOnBrand: "#ffffff",
} as const;

function absolutePublicUrl(path: string): string {
  const base = env.appUrl().replace(/\/$/, "");
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

const bodyParagraphStyle = `margin:0 0 12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:${mailTheme.textSecondary};`;

/**
 * Minimal table-based shell: logo, title, body, solid brand CTA, footer.
 * Inline CSS only for client compatibility.
 */
export function renderMailLayout(input: TMailLayoutInput): string {
  const appName = env.appName();
  const logoUrl = absolutePublicUrl("/crawllex-dark.png");
  const preview = input.previewText
    ? `<div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">${escapeHtml(input.previewText)}</div>`
    : "";

  const ctaBlock = input.cta
    ? `
      <tr>
        <td style="padding:8px 0 4px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td align="center" bgcolor="${mailTheme.brand}" style="border-radius:8px;background-color:${mailTheme.brand};">
                <a
                  href="${escapeAttribute(input.cta.url)}"
                  target="_blank"
                  rel="noopener noreferrer"
                  style="display:inline-block;padding:12px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:14px;font-weight:600;line-height:1.25;color:${mailTheme.textOnBrand};text-decoration:none;border-radius:8px;"
                >${escapeHtml(input.cta.label)}</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:12px 0 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:12px;line-height:1.5;color:${mailTheme.textMuted};word-break:break-all;">
          Or open this link:<br />
          <a href="${escapeAttribute(input.cta.url)}" style="color:${mailTheme.brand};text-decoration:underline;">${escapeHtml(input.cta.url)}</a>
        </td>
      </tr>`
    : "";

  const footerNote = input.footerNote
    ? `<tr>
        <td style="padding:20px 0 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:13px;line-height:1.55;color:${mailTheme.textSecondary};">
          ${escapeHtml(input.footerNote)}
        </td>
      </tr>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>${escapeHtml(input.title)}</title>
</head>
<body style="margin:0;padding:0;background-color:${mailTheme.bgMain};">
  ${preview}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${mailTheme.bgMain};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background-color:${mailTheme.bgCard};border:1px solid ${mailTheme.border};border-radius:12px;">
          <tr>
            <td style="padding:28px 28px 8px;">
              <img
                src="${escapeAttribute(logoUrl)}"
                alt="${escapeAttribute(appName)}"
                width="140"
                height="24"
                style="display:block;width:140px;height:auto;border:0;outline:none;text-decoration:none;"
              />
            </td>
          </tr>
          <tr>
            <td style="padding:16px 28px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:20px;font-weight:700;line-height:1.3;color:${mailTheme.textPrimary};">
              ${escapeHtml(input.title)}
            </td>
          </tr>
          <tr>
            <td style="padding:14px 28px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:${mailTheme.textSecondary};">
              ${input.bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:8px 28px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                ${ctaBlock}
                ${footerNote}
              </table>
            </td>
          </tr>
        </table>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">
          <tr>
            <td style="padding:16px 8px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:12px;line-height:1.5;color:${mailTheme.textMuted};text-align:center;">
              Sent by ${escapeHtml(appName)}. This is a transactional message related to your account.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Build body HTML from sentence-case paragraphs (escaped). */
export function mailBodyParagraphs(...paragraphs: string[]): string {
  return paragraphs
    .map((p) => `<p style="${bodyParagraphStyle}">${escapeHtml(p)}</p>`)
    .join("");
}

/**
 * Build body HTML from trusted/escaped fragments (may include inline `<strong>` etc.).
 */
export function mailBodyHtml(...safeHtmlParagraphs: string[]): string {
  return safeHtmlParagraphs
    .map((html) => `<p style="${bodyParagraphStyle}">${html}</p>`)
    .join("");
}

/** Escaped bold span using the mail primary ink color. */
export function mailStrong(text: string): string {
  return `<strong style="color:${mailTheme.textPrimary};">${escapeHtml(text)}</strong>`;
}
