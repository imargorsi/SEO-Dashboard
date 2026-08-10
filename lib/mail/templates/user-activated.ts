import { env } from "@/lib/config/env";
import { mailBodyParagraphs, renderMailLayout } from "@/lib/mail/templates/layout";
import type { TMailContent } from "@/lib/mail/templates/types";

export function userActivatedMailContent(input: { signInUrl: string }): TMailContent {
  const app = env.appName();

  return {
    subject: `Your ${app} Account Was Activated`,
    text: [
      "Hello!",
      "",
      `Your ${app} account was activated. You can sign in again.`,
      "",
      `Sign in: ${input.signInUrl}`,
      "",
      "If you were not expecting this update, contact your platform admin.",
    ].join("\n"),
    html: renderMailLayout({
      title: "Account Activated",
      previewText: `Your ${app} account was activated. You can sign in again.`,
      bodyHtml: mailBodyParagraphs(
        "Hello!",
        `Your ${app} account was activated. You can sign in again.`,
      ),
      cta: { label: "Sign In", url: input.signInUrl },
      footerNote: "If you were not expecting this update, contact your platform admin.",
    }),
  };
}
