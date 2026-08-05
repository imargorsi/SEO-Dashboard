import { env } from "@/lib/config/env";
import { escapeHtml } from "@/lib/mail/templates/escape";
import { mailBodyHtml, mailStrong, renderMailLayout } from "@/lib/mail/templates/layout";
import type { TMailContent } from "@/lib/mail/templates/types";

export function projectInviteMailContent(input: {
  projectName: string;
  inviterName: string;
  invitationsUrl: string;
}): TMailContent {
  const app = env.appName();

  return {
    subject: `You Were Invited To ${input.projectName} On ${app}`,
    text: [
      "Hello!",
      "",
      `${input.inviterName} invited you to join "${input.projectName}" on ${app}.`,
      "",
      "Open your projects page to Accept or Decline the invitation:",
      input.invitationsUrl,
      "",
      "If you were not expecting this invitation, you can safely ignore this email.",
    ].join("\n"),
    html: renderMailLayout({
      title: "Project Invitation",
      previewText: `${input.inviterName} invited you to join ${input.projectName} on ${app}.`,
      bodyHtml: mailBodyHtml(
        "Hello!",
        `${mailStrong(input.inviterName)} invited you to join ${mailStrong(input.projectName)} on ${escapeHtml(app)}.`,
        "Open your projects page to accept or decline the invitation.",
      ),
      cta: { label: "Open Projects", url: input.invitationsUrl },
      footerNote: "If you were not expecting this invitation, you can safely ignore this email.",
    }),
  };
}
