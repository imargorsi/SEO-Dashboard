import { env } from "@/lib/config/env";
import { mailBodyParagraphs, renderMailLayout } from "@/lib/mail/templates/layout";
import type { TMailContent } from "@/lib/mail/templates/types";

export function userDeactivatedMailContent(): TMailContent {
  const app = env.appName();

  return {
    subject: `Your ${app} Account Was Deactivated`,
    text: [
      "Hello!",
      "",
      `Your ${app} account was deactivated. You will not be able to sign in until it is activated again.`,
      "",
      "If you have questions, contact your platform admin.",
    ].join("\n"),
    html: renderMailLayout({
      title: "Account Deactivated",
      previewText: `Your ${app} account was deactivated.`,
      bodyHtml: mailBodyParagraphs(
        "Hello!",
        `Your ${app} account was deactivated. You will not be able to sign in until it is activated again.`,
      ),
      footerNote: "If you have questions, contact your platform admin.",
    }),
  };
}
