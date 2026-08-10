import { env } from "@/lib/config/env";
import { escapeHtml } from "@/lib/mail/templates/escape";
import { mailBodyHtml, mailStrong, renderMailLayout } from "@/lib/mail/templates/layout";
import type { TMailContent } from "@/lib/mail/templates/types";

export function projectDeletedMailContent(input: {
  projectName: string;
  projectsUrl: string;
}): TMailContent {
  const app = env.appName();

  return {
    subject: `Your ${app} Project Was Deleted`,
    text: [
      "Hello!",
      "",
      `"${input.projectName}" was permanently deleted from ${app}.`,
      "",
      "Open your projects page to view your remaining workspaces:",
      input.projectsUrl,
      "",
      "If you have questions, contact your platform admin.",
    ].join("\n"),
    html: renderMailLayout({
      title: "Project Deleted",
      previewText: `${input.projectName} was permanently deleted from ${app}.`,
      bodyHtml: mailBodyHtml(
        "Hello!",
        `${mailStrong(input.projectName)} was permanently deleted from ${escapeHtml(app)}.`,
        "Open your projects page to view your remaining workspaces.",
      ),
      cta: { label: "Open Projects", url: input.projectsUrl },
      footerNote: "If you have questions, contact your platform admin.",
    }),
  };
}
