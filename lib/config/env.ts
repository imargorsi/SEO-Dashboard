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

export const env = {
  mongodbUri: () => required("MONGODB_URI"),
  bcryptRounds: () => Number(process.env.BCRYPT_ROUNDS ?? "12"),
  appUrl: () => optional("APP_URL", "http://localhost:3000"),
  frontendUrl: () => optional("FRONTEND_URL", "http://localhost:3000"),
  appKey: () => required("APP_KEY"),
  appName: () => optional("APP_NAME", "SEO Dashboard"),
  superAdminEmail: () => optional("SUPER_ADMIN_EMAIL", "superadmin@example.com"),
  superAdminPassword: () => optional("SUPER_ADMIN_PASSWORD", "password"),
  mailFrom: () => optional("MAIL_FROM_ADDRESS", "noreply@example.com"),
  mailFromName: () => optional("MAIL_FROM_NAME", "SEO Dashboard"),
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
};
