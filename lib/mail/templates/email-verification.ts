import { env } from "@/lib/config/env";
import { mailBodyParagraphs, renderMailLayout } from "@/lib/mail/templates/layout";
import type { TMailContent } from "@/lib/mail/templates/types";

export function emailVerificationMailContent(verificationUrl: string): TMailContent {
  const app = env.appName();

  return {
    subject: `Verify Your ${app} Email Address`,
    text: [
      "Hello!",
      "",
      "Please verify your email address by clicking the link below:",
      verificationUrl,
      "",
      "If you did not create an account, no further action is required.",
    ].join("\n"),
    html: renderMailLayout({
      title: "Verify Your Email Address",
      previewText: `Confirm your email to finish setting up your ${app} account.`,
      bodyHtml: mailBodyParagraphs(
        "Hello!",
        "Please verify your email address by clicking the button below.",
      ),
      cta: { label: "Verify Email", url: verificationUrl },
      footerNote: "If you did not create an account, no further action is required.",
    }),
  };
}
