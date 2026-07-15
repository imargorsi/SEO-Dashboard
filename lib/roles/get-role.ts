import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { NotFoundError } from "@/lib/api/http-errors";
import { ApiResponse } from "@/lib/api/response";
import { isHiddenFromAdminRoleUi } from "@/lib/rbac/roles";
import { resolveRoleMemberCounts } from "@/lib/roles/resolve-role-member-counts";
import { serializeAdminRoleDetail } from "@/lib/serializers/admin-role";
import { Role, type RoleDocument } from "@/models";

export async function getAdminRoleById(roleId: string): Promise<RoleDocument> {
  if (!mongoose.Types.ObjectId.isValid(roleId)) {
    throw new NotFoundError("Role");
  }

  const role = await Role.findById(roleId);

  if (!role || isHiddenFromAdminRoleUi(role.slug) || isHiddenFromAdminRoleUi(role.name)) {
    throw new NotFoundError("Role");
  }

  return role;
}

export async function buildGetAdminRoleResponse(role: RoleDocument): Promise<NextResponse> {
  const counts = await resolveRoleMemberCounts([role._id]);
  const membersCount = counts.get(role._id.toString()) ?? 0;

  return ApiResponse.success(serializeAdminRoleDetail(role, membersCount));
}
