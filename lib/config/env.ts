function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optional(name: string, fallback = ""): string {
  return process.env[name] ?? fallback;
}

/**
 * PEM from `.env` / Hostinger hPanel.
 * Panels often: wrap quotes, leave literal `\n`, or turn `+` into spaces in the body.
 * Also accepts a base64-encoded full PEM (safest on Hostinger).
 */
export function normalizeGooglePrivateKey(raw: string): string {
  let value = raw.trim();
  if (!value) return value;

  if (!value.includes("BEGIN") && /^[A-Za-z0-9+/=\s]+$/.test(value) && value.length >= 64) {
    try {
      const decoded = Buffer.from(value.replace(/\s+/g, ""), "base64").toString("utf8").trim();
      if (decoded.includes("BEGIN")) value = decoded;
    } catch {
      // keep original
    }
  }

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1).trim();
  }

  // Hostinger sometimes double-escapes (`\\n`); keep replacing until real newlines.
  while (value.includes("\\n")) {
    value = value.replace(/\\n/g, "\n");
  }

  // Some hosts URL-decode env values and turn PEM `+` into spaces.
  value = value
    .split("\n")
    .map((line) => (line.startsWith("-----") ? line : line.replace(/ /g, "+")))
    .join("\n");

  return value;
}

export const env = {
  mongodbUri: () => required("MONGODB_URI"),
  bcryptRounds: () => Number(process.env.BCRYPT_ROUNDS ?? "12"),
  appUrl: () => optional("APP_URL", "http://localhost:3000"),
  frontendUrl: () => optional("FRONTEND_URL", "http://localhost:3000"),
  appKey: () => required("APP_KEY"),
  appName: () => optional("APP_NAME", "Crawllex"),
  superAdminEmail: () => optional("SUPER_ADMIN_EMAIL", "superadmin@example.com"),
  superAdminPassword: () => optional("SUPER_ADMIN_PASSWORD", "password"),
  mailFrom: () => optional("MAIL_FROM_ADDRESS", "noreply@example.com"),
  mailFromName: () => optional("MAIL_FROM_NAME", "Crawllex"),
  mailLogOnly: () => optional("MAIL_MAILER", "log") === "log",
  smtpHost: () => optional("MAIL_HOST"),
  smtpPort: () => Number(optional("MAIL_PORT", "587")),
  smtpUser: () => optional("MAIL_USERNAME"),
  smtpPass: () => optional("MAIL_PASSWORD"),
  smtpConfigured: () => {
    if (optional("MAIL_MAILER", "log") === "log") return false;
    return Boolean(optional("MAIL_HOST") && optional("MAIL_USERNAME") && optional("MAIL_PASSWORD"));
  },
  passwordResetExpireMinutes: () => Number(optional("PASSWORD_RESET_EXPIRE", "60")),
  passwordResetThrottleSeconds: () => Number(optional("PASSWORD_RESET_THROTTLE", "60")),
  emailVerificationExpireMinutes: () => Number(optional("EMAIL_VERIFICATION_EXPIRE", "60")),
  /** Protects `/api/v1/cron/*` routes. */
  cronSecret: () => optional("CRON_SECRET"),
  /**
   * Google Service Account — either JSON blob or email + private key.
   * Private key may use `\n` escaped newlines in env files / Hostinger.
   */
  googleServiceAccountJson: () => optional("GOOGLE_SERVICE_ACCOUNT_JSON"),
  googleServiceAccountEmail: () => optional("GOOGLE_SERVICE_ACCOUNT_EMAIL"),
  googleServiceAccountPrivateKey: () =>
    normalizeGooglePrivateKey(optional("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY")),
  googleConfigured: () => {
    if (optional("GOOGLE_SERVICE_ACCOUNT_JSON")) return true;
    return Boolean(
      optional("GOOGLE_SERVICE_ACCOUNT_EMAIL") && optional("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY"),
    );
  },
  /**
   * Google OAuth (sign-in / sign-up) — separate from analytics Service Account.
   * Redirect URI must match the Cloud Console OAuth client exactly.
   */
  googleOAuthClientId: () => optional("GOOGLE_OAUTH_CLIENT_ID"),
  googleOAuthClientSecret: () => optional("GOOGLE_OAUTH_CLIENT_SECRET"),
  googleOAuthRedirectUri: () =>
    optional(
      "GOOGLE_OAUTH_REDIRECT_URI",
      `${optional("APP_URL", "http://localhost:3000").replace(/\/$/, "")}/api/v1/auth/google/callback`,
    ),
  googleOAuthConfigured: () =>
    Boolean(optional("GOOGLE_OAUTH_CLIENT_ID") && optional("GOOGLE_OAUTH_CLIENT_SECRET")),
};
