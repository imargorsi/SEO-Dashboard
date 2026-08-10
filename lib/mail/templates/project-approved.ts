import { env } from "@/lib/config/env";
import { escapeHtml } from "@/lib/mail/templates/escape";
import { mailBodyHtml, mailStrong, renderMailLayout } from "@/lib/mail/templates/layout";
import type { TMailContent } from "@/lib/mail/templates/types";

export function projectApprovedMailContent(input: {
  projectName: string;
  projectsUrl: string;
}): TMailContent {
  const app = env.appName();

  return {
    subject: `Your ${app} Project Was Approved`,
    text: [
      "Hello!",
      "",
      `"${input.projectName}" was approved and is now active on ${app}.`,
      "",
      "Open your projects page to start working in this workspace:",
      input.projectsUrl,
      "",
      "If you were not expecting this update, contact your platform admin.",
    ].join("\n"),
    html: renderMailLayout({
      title: "Project Approved",
      previewText: `${input.projectName} was approved and is now active on ${app}.`,
      bodyHtml: mailBodyHtml(
        "Hello!",
        `${mailStrong(input.projectName)} was approved and is now active on ${escapeHtml(app)}.`,
        "Open your projects page to start working in this workspace.",
      ),
      cta: { label: "Open Projects", url: input.projectsUrl },
      footerNote: "If you were not expecting this update, contact your platform admin.",
    }),
  };
}
