import { env } from "@/lib/config/env";
import { sendMail } from "@/lib/mail/client";
import type { TMailContent } from "@/lib/mail/templates";
import { PROJECT_OWNER_ROLE } from "@/lib/rbac/roles";
import { ProjectMember, Role, User, type ProjectDocument } from "@/models";

/**
 * Resolve the current project owner's mailbox.
 * Prefer active `project_owner` membership (survives reassignment), then `pocEmail`,
 * then legacy `createdByUserId`.
 */
export async function resolveProjectOwnerEmail(project: ProjectDocument): Promise<string | null> {
  const ownerRole = await Role.findOne({ slug: PROJECT_OWNER_ROLE }).select("_id");
  if (ownerRole) {
    const ownerMember = await ProjectMember.findOne({
      projectId: project._id,
      roleId: ownerRole._id,
      status: "active",
    })
      .sort({ createdAt: 1 })
      .select("userId");

    if (ownerMember?.userId) {
      const owner = await User.findById(ownerMember.userId).select("email");
      if (owner?.email) {
        return owner.email.toLowerCase();
      }
    }
  }

  const poc = project.pocEmail?.trim();
  if (poc) {
    return poc.toLowerCase();
  }

  if (project.createdByUserId) {
    const creator = await User.findById(project.createdByUserId).select("email");
    if (creator?.email) {
      return creator.email.toLowerCase();
    }
  }

  return null;
}

export function projectListUrl(): string {
  return `${env.frontendUrl().replace(/\/$/, "")}/projects`;
}

/**
 * Soft-fail owner notification (same policy as project invite mail).
 * Status / create / delete success must not depend on SMTP or recipient lookup.
 */
export async function sendProjectOwnerMail(input: {
  project: ProjectDocument;
  /** Optional override when the owner email is already known (e.g. create). */
  to?: string;
  mail: TMailContent;
  logLabel: string;
}): Promise<boolean> {
  try {
    const to = (input.to ?? (await resolveProjectOwnerEmail(input.project)))?.trim();
    if (!to) {
      console.error(`[${input.logLabel}] No owner email for project ${input.project._id.toString()}`);
      return false;
    }

    await sendMail({
      to,
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
