import mongoose from "mongoose";

import { ValidationError } from "@/lib/api/http-errors";
import { assignProjectMember } from "@/lib/projects/assign-member";
import { PROJECT_OWNER_ROLE } from "@/lib/rbac/roles";
import { getAdminUserById } from "@/lib/users/get-user";
import { resolveUserProjectAssignments } from "@/lib/users/resolve-user-project-assignments";
import type { TAdminUserProjectAssignment } from "@/types/admin-user.types";
import { Project } from "@/models/Project";
import { ProjectMember } from "@/models/ProjectMember";
import { Role } from "@/models/Role";

async function getOwnerRoleId(): Promise<mongoose.Types.ObjectId> {
  const ownerRole = await Role.findOne({ slug: PROJECT_OWNER_ROLE, scope: "project" }).select("_id");
  if (!ownerRole) {
    throw new Error("project_owner role is missing — run seed");
  }
  return ownerRole._id;
}

/** Count active memberships on a project that use the project_owner role. */
export async function countActiveProjectOwners(projectId: string): Promise<number> {
  const ownerRoleId = await getOwnerRoleId();
  return ProjectMember.countDocuments({
    projectId,
    roleId: ownerRoleId,
    status: "active",
  });
}

/**
 * Blocks removing or demoting the last active project_owner.
 * `nextRoleId` null means the membership will be removed / set removed.
 */
export async function assertLastOwnerSafe(params: {
  projectId: string;
  userId: string;
  nextRoleId: string | null;
}): Promise<void> {
  const ownerRoleId = await getOwnerRoleId();
  const membership = await ProjectMember.findOne({
    projectId: params.projectId,
    userId: params.userId,
    status: { $in: ["active", "invited"] },
  }).select("roleId status");

  const isCurrentlyActiveOwner =
    membership?.status === "active" && membership.roleId.equals(ownerRoleId);
  if (!isCurrentlyActiveOwner) return;

  const staysOwner = params.nextRoleId !== null && params.nextRoleId === ownerRoleId.toString();
  if (staysOwner) return;

  const ownerCount = await countActiveProjectOwners(params.projectId);
  if (ownerCount <= 1) {
    throw ValidationError.fromFieldErrors({
      roleId: ["The Last Active Project Owner Cannot Be Removed Or Demoted."],
    });
  }
}

export async function upsertAdminUserMembership(
  userId: string,
  input: { projectId: string; roleId: string },
): Promise<{ assignments: TAdminUserProjectAssignment[] }> {
  const user = await getAdminUserById(userId);

  if (!mongoose.isValidObjectId(input.projectId)) {
    throw ValidationError.fromFieldErrors({
      projectId: ["The Selected Project Is Invalid."],
    });
  }

  const project = await Project.findById(input.projectId).select("_id status");
  if (!project) {
    throw ValidationError.fromFieldErrors({
      projectId: ["Project Not Found."],
    });
  }

  if (project.status === "rejected") {
    throw ValidationError.fromFieldErrors({
      projectId: ["Rejected Projects Cannot Accept Members."],
    });
  }

  // Ensure email-verified accounts only (same bar as invite).
  if (!user.emailVerifiedAt) {
    throw ValidationError.fromFieldErrors({
      userId: ["User Email Must Be Verified Before Project Assignment."],
    });
  }

  await assertLastOwnerSafe({
    projectId: input.projectId,
    userId,
    nextRoleId: input.roleId,
  });

  await assignProjectMember({
    projectId: input.projectId,
    userId,
    roleId: input.roleId,
    status: "active",
    invitedByUserId: null,
  });

  const map = await resolveUserProjectAssignments([userId]);
  return { assignments: map.get(userId) ?? [] };
}

export async function removeAdminUserMembership(
  userId: string,
  projectId: string,
): Promise<{ assignments: TAdminUserProjectAssignment[] }> {
  await getAdminUserById(userId);

  if (!mongoose.isValidObjectId(projectId)) {
    throw ValidationError.fromFieldErrors({
      projectId: ["The Selected Project Is Invalid."],
    });
  }

  const membership = await ProjectMember.findOne({
    projectId,
    userId,
    status: { $in: ["active", "invited"] },
  });

  if (!membership) {
    throw ValidationError.fromFieldErrors({
      projectId: ["Membership Not Found."],
    });
  }

  await assertLastOwnerSafe({
    projectId,
    userId,
    nextRoleId: null,
  });

  membership.status = "removed";
  await membership.save();

  const map = await resolveUserProjectAssignments([userId]);
  return { assignments: map.get(userId) ?? [] };
}
