import { env } from "@/lib/config/env";
import { mailBodyParagraphs, renderMailLayout } from "@/lib/mail/templates/layout";
import type { TMailContent } from "@/lib/mail/templates/types";

export function passwordResetMailContent(resetUrl: string, expireMinutes: number): TMailContent {
  const app = env.appName();

  return {
    subject: `Reset Your ${app} Password`,
    text: [
      "Hello!",
      "",
      "You are receiving this email because we received a password reset request for your account.",
      "",
      `Reset password: ${resetUrl}`,
      "",
      `This link will expire in ${expireMinutes} minutes.`,
      "",
      "If you did not request a password reset, no further action is required.",
    ].join("\n"),
    html: renderMailLayout({
      title: "Reset Your Password",
      previewText: `Reset your ${app} password. This link expires in ${expireMinutes} minutes.`,
      bodyHtml: mailBodyParagraphs(
        "Hello!",
        "You are receiving this email because we received a password reset request for your account.",
        `This link will expire in ${expireMinutes} minutes.`,
      ),
      cta: { label: "Reset Password", url: resetUrl },
      footerNote: "If you did not request a password reset, no further action is required.",
    }),
  };
}
