import mongoose from "mongoose";

import { NotFoundError, ValidationError } from "@/lib/api/http-errors";
import { isActiveRoleStatus } from "@/lib/roles/constants";
import { Role, type RoleDocument } from "@/models/Role";

export async function resolveProjectRoleBySlug(slug: string): Promise<RoleDocument> {
  const role = await Role.findOne({ slug, scope: "project" });
  if (!role) {
    throw new Error(`Project role not found: ${slug}`);
  }

  if (!isActiveRoleStatus(role.status)) {
    throw ValidationError.fromFieldErrors({
      role: ["This Role Is Inactive And Cannot Be Assigned."],
    });
  }

  return role;
}

export async function resolveProjectRoleById(roleId: string): Promise<RoleDocument> {
  if (!mongoose.isValidObjectId(roleId)) {
    throw ValidationError.fromFieldErrors({
      roleId: ["The Selected Role Is Invalid."],
    });
  }

  const role = await Role.findOne({ _id: roleId, scope: "project" });
  if (!role) {
    throw new NotFoundError("Role");
  }

  if (!isActiveRoleStatus(role.status)) {
    throw ValidationError.fromFieldErrors({
      roleId: ["This Role Is Inactive And Cannot Be Assigned."],
    });
  }

  return role;
}
