import { env } from "@/lib/config/env";
import { escapeHtml } from "@/lib/mail/templates/escape";
import { mailBodyHtml, mailStrong, renderMailLayout } from "@/lib/mail/templates/layout";
import type { TMailContent } from "@/lib/mail/templates/types";

export function projectDeactivatedMailContent(input: {
  projectName: string;
  projectsUrl: string;
}): TMailContent {
  const app = env.appName();

  return {
    subject: `Your ${app} Project Was Deactivated`,
    text: [
      "Hello!",
      "",
      `"${input.projectName}" was deactivated on ${app}.`,
      "",
      "Open your projects page to review the project status:",
      input.projectsUrl,
      "",
      "If you have questions, contact your platform admin.",
    ].join("\n"),
    html: renderMailLayout({
      title: "Project Deactivated",
      previewText: `${input.projectName} was deactivated on ${app}.`,
      bodyHtml: mailBodyHtml(
        "Hello!",
        `${mailStrong(input.projectName)} was deactivated on ${escapeHtml(app)}.`,
        "Open your projects page to review the project status.",
      ),
      cta: { label: "Open Projects", url: input.projectsUrl },
      footerNote: "If you have questions, contact your platform admin.",
    }),
  };
}
