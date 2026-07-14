import mongoose from "mongoose";
import { NextResponse } from "next/server";

import { ApiResponse } from "@/lib/api/response";
import { ValidationError } from "@/lib/api/http-errors";
import type { AuthContext } from "@/lib/auth/guards";
import { getProjectForUser } from "@/lib/projects/get-project";
import { PROJECT_OWNER_ROLE } from "@/lib/rbac/roles";
import { ProjectMember, Role } from "@/models";

/**
 * Removes a pending invite or an active project_user from the project.
 * Does not allow removing project owners.
 */
export async function removeProjectInvitee(
  auth: AuthContext,
  projectId: string,
  userId: string,
): Promise<{ removedStatus: "invited" | "active" }> {
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

  const member = await ProjectMember.findOne({
    projectId,
    userId,
    status: { $in: ["invited", "active"] },
  });

  if (!member) {
    throw ValidationError.fromFieldErrors({
      userId: ["Member Or Invitation Not Found."],
    });
  }

  if (member.status === "active") {
    const ownerRole = await Role.findOne({ slug: PROJECT_OWNER_ROLE }).select("_id");
    if (ownerRole && member.roleId.equals(ownerRole._id)) {
      throw ValidationError.fromFieldErrors({
        userId: ["Project Owners Cannot Be Removed From This Step."],
      });
    }
  }

  const removedStatus = member.status === "active" ? ("active" as const) : ("invited" as const);
  member.status = "removed";
  await member.save();

  return { removedStatus };
}

export function buildRemoveProjectInviteeResponse(
  removedStatus: "invited" | "active",
): NextResponse {
  return ApiResponse.success(
    null,
    removedStatus === "active" ? "Member Removed." : "Invitation Removed.",
  );
}
