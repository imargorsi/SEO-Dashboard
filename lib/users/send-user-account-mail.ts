import { env } from "@/lib/config/env";
import { sendMail } from "@/lib/mail/client";
import type { TMailContent } from "@/lib/mail/templates";

export function signInUrl(): string {
  return `${env.frontendUrl().replace(/\/$/, "")}/sign-in`;
}

/**
 * Soft-fail account notification (same policy as project lifecycle mail).
 * Activate / deactivate success must not depend on SMTP.
 */
export async function sendUserAccountMail(input: {
  to: string;
  mail: TMailContent;
  logLabel: string;
}): Promise<boolean> {
  const to = input.to.trim();
  if (!to) {
    console.error(`[${input.logLabel}] No email address for user account mail`);
    return false;
  }

  try {
    await sendMail({
      to: to.toLowerCase(),
      subject: input.mail.subject,
      text: input.mail.text,
      html: input.mail.html,
    });
    return true;
  } catch (error) {
    console.error(`[${input.logLabel}] Failed to send email:`, error);
    return false;
  }
}
