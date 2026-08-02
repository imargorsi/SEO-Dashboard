import mongoose from "mongoose";

import { ValidationError } from "@/lib/api/http-errors";
import type { AuthContext } from "@/lib/auth/guards";
import { assignProjectMember } from "@/lib/projects/assign-member";
import { resolveProjectRoleBySlug } from "@/lib/projects/resolve-role";
import { isSuperAdmin } from "@/lib/rbac/access";
import { PROJECT_OWNER_ROLE, PROJECT_USER_ROLE } from "@/lib/rbac/roles";
import { ProjectMember, Role, User, type ProjectDocument } from "@/models";

/**
 * Super-admin only: set a verified existing user as the sole active project owner,
 * demote previous owners to `project_user`, and sync `pocEmail` to the new owner.
 */
export async function reassignProjectOwner(
  auth: AuthContext,
  project: ProjectDocument,
  ownerUserId: string | null | undefined,
): Promise<void> {
  if (!isSuperAdmin(auth.user.roles)) {
    throw ValidationError.fromFieldErrors({
      ownerUserId: ["Only Platform Admins Can Reassign The Project Owner."],
    });
  }

  const trimmed = ownerUserId?.trim() ?? "";
  if (!trimmed) {
    throw ValidationError.fromFieldErrors({
      ownerUserId: ["Project Owner Is Required."],
    });
  }

  if (!mongoose.Types.ObjectId.isValid(trimmed)) {
    throw ValidationError.fromFieldErrors({
      ownerUserId: ["The Selected Owner Is Invalid."],
    });
  }

  const owner = await User.findById(trimmed);
  if (!owner) {
    throw ValidationError.fromFieldErrors({
      ownerUserId: ["The Selected Owner Does Not Exist."],
    });
  }

  if (!owner.hasVerifiedEmail()) {
    throw ValidationError.fromFieldErrors({
      ownerUserId: ["The Selected Owner Must Have A Verified Email."],
    });
  }

  const ownerRole = await Role.findOne({ slug: PROJECT_OWNER_ROLE }).select("_id");
  if (!ownerRole) {
    throw new Error("Project owner role not found.");
  }

  const projectUserRole = await resolveProjectRoleBySlug(PROJECT_USER_ROLE);
  const currentOwners = await ProjectMember.find({
    projectId: project._id,
    roleId: ownerRole._id,
    status: "active",
  });

  const alreadySoleOwner =
    currentOwners.length === 1 && currentOwners[0]!.userId.equals(owner._id);

  if (!alreadySoleOwner) {
    for (const member of currentOwners) {
      if (member.userId.equals(owner._id)) continue;
      member.roleId = projectUserRole._id;
      await member.save();
    }

    await assignProjectMember({
      projectId: project._id,
      userId: owner._id,
      roleSlug: PROJECT_OWNER_ROLE,
      status: "active",
    });
  }

  project.pocEmail = owner.email.toLowerCase();
}
