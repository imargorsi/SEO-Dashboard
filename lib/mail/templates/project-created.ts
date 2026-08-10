import { env } from "@/lib/config/env";
import { escapeHtml } from "@/lib/mail/templates/escape";
import { mailBodyHtml, mailStrong, renderMailLayout } from "@/lib/mail/templates/layout";
import type { TMailContent } from "@/lib/mail/templates/types";

export function projectCreatedMailContent(input: {
  projectName: string;
  status: "pending" | "active";
  projectsUrl: string;
}): TMailContent {
  const app = env.appName();
  const isPending = input.status === "pending";

  const subject = isPending
    ? `Your ${app} Project Is Pending Approval`
    : `Your ${app} Project Is Ready`;

  const title = isPending ? "Project Submitted" : "Project Created";
  const previewText = isPending
    ? `${input.projectName} was submitted and is waiting for approval.`
    : `${input.projectName} was created and is ready to use on ${app}.`;
  const bodyLead = isPending
    ? `${mailStrong(input.projectName)} was submitted on ${escapeHtml(app)} and is pending approval.`
    : `${mailStrong(input.projectName)} was created on ${escapeHtml(app)} and is ready to use.`;
  const bodyNext = isPending
    ? "You will get another email when it is approved or rejected."
    : "Open your projects page to start working in this workspace.";
  const footerNote = isPending
    ? "If you did not create this project, you can safely ignore this email."
    : "If you were not expecting this project, contact your platform admin.";

  return {
    subject,
    text: [
      "Hello!",
      "",
      isPending
        ? `"${input.projectName}" was submitted on ${app} and is pending approval.`
        : `"${input.projectName}" was created on ${app} and is ready to use.`,
      "",
      bodyNext,
      "",
      `Open projects: ${input.projectsUrl}`,
      "",
      footerNote,
    ].join("\n"),
    html: renderMailLayout({
      title,
      previewText,
      bodyHtml: mailBodyHtml("Hello!", bodyLead, bodyNext),
      cta: { label: "Open Projects", url: input.projectsUrl },
      footerNote,
    }),
  };
}
