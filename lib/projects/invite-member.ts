import mongoose from "mongoose";
import { NextResponse } from "next/server";

import { ApiResponse } from "@/lib/api/response";
import { ValidationError } from "@/lib/api/http-errors";
import type { AuthContext } from "@/lib/auth/guards";
import { assignProjectMember } from "@/lib/projects/assign-member";
import { getProjectForUser } from "@/lib/projects/get-project";
import { projectInviteMailContent, sendMail } from "@/lib/mail/client";
import { env } from "@/lib/config/env";
import { serializeStoredImageUrl } from "@/lib/serializers/stored-image";
import { PROJECT_USER_ROLE, SUPER_ADMIN_ROLE } from "@/lib/rbac/roles";
import { seedSystemRoles } from "@/lib/rbac/seed-roles";
import { ProjectMember, User } from "@/models";
import type { TProjectInviteMember } from "@/types/project-invite.types";

export type TProjectInviteMemberDto = TProjectInviteMember;

export type TInviteProjectMemberResult = {
  invite: TProjectInviteMemberDto;
  emailSent: boolean;
};

export async function inviteProjectMember(
  auth: AuthContext,
  projectId: string,
  userId: string,
): Promise<TInviteProjectMemberResult> {
  await seedSystemRoles();

  if (!mongoose.isValidObjectId(userId)) {
    throw ValidationError.fromFieldErrors({
      userId: ["The Selected User Is Invalid."],
    });
  }

  const project = await getProjectForUser(auth, projectId);
  if (!project) {
    throw ValidationError.fromFieldErrors({
      projectId: ["Project Not Found."],
    });
  }

  if (project.status === "rejected") {
    throw ValidationError.fromFieldErrors({
      projectId: ["Cannot Invite Users To A Rejected Project."],
    });
  }

  if (userId === auth.user._id.toString()) {
    throw ValidationError.fromFieldErrors({
      userId: ["You Cannot Invite Yourself."],
    });
  }

  const invitee = await User.findById(userId);
  if (!invitee) {
    throw ValidationError.fromFieldErrors({
      userId: ["User Must Register Before Being Invited."],
    });
  }

  if (!invitee.hasVerifiedEmail()) {
    throw ValidationError.fromFieldErrors({
      userId: ["The Selected User Must Have A Verified Email."],
    });
  }

  if (invitee.roles.includes(SUPER_ADMIN_ROLE)) {
    throw ValidationError.fromFieldErrors({
      userId: ["Platform Admins Cannot Be Invited As Project Users."],
    });
  }

  const existing = await ProjectMember.findOne({ projectId, userId: invitee._id });
  if (existing?.status === "active") {
    throw ValidationError.fromFieldErrors({
      userId: ["This User Is Already A Member Of This Project."],
    });
  }

  if (existing?.status === "invited") {
    throw ValidationError.fromFieldErrors({
      userId: ["This User Has Already Been Invited To This Project."],
    });
  }

  const member = await assignProjectMember({
    projectId,
    userId: invitee._id,
    roleSlug: PROJECT_USER_ROLE,
    status: "invited",
    invitedByUserId: auth.user._id,
  });

  const invitationsUrl = `${env.frontendUrl().replace(/\/$/, "")}/projects`;
  const mail = projectInviteMailContent({
    projectName: project.businessName,
    inviterName: auth.user.name,
    invitationsUrl,
  });

  let emailSent = true;
  try {
    await sendMail({
      to: invitee.email,
      subject: mail.subject,
      text: mail.text,
    });
  } catch (error) {
    emailSent = false;
    console.error("[invite] Failed to send invitation email:", error);
  }

  return {
    invite: {
      id: member._id.toString(),
      userId: invitee._id.toString(),
      name: invitee.name,
      email: invitee.email,
      profileImage: serializeStoredImageUrl(invitee.profileImage),
      status: "invited",
      invitedByUserId: auth.user._id.toString(),
    },
    emailSent,
  };
}

export function buildInviteProjectMemberResponse(
  invite: TProjectInviteMemberDto,
  emailSent: boolean,
): NextResponse {
  return ApiResponse.success(
    invite,
    emailSent
      ? "Invitation Sent."
      : "Invitation Created But Email Could Not Be Sent.",
    201,
  );
}
