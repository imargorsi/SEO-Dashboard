import { NextResponse } from "next/server";

import { ValidationError } from "@/lib/api/http-errors";
import { ApiResponse } from "@/lib/api/response";
import type { AuthContext } from "@/lib/auth/guards";
import { getAdminRoleById } from "@/lib/roles/get-role";
import { resolveRoleMemberCounts } from "@/lib/roles/resolve-role-member-counts";
import { isActiveRoleStatus, type TRoleStatus } from "@/lib/roles/constants";
import { serializeAdminRoleDetail } from "@/lib/serializers/admin-role";
import { ProjectMember } from "@/models";
import type { RoleDocument } from "@/models/Role";

function assertRoleStatus(role: RoleDocument, expectedStatus: TRoleStatus, actionLabel: string): void {
  const current = isActiveRoleStatus(role.status) ? "active" : "inactive";
  if (current !== expectedStatus) {
    throw new ValidationError(
      { status: [`Role Must Be ${expectedStatus === "active" ? "Active" : "Inactive"} To ${actionLabel}.`] },
      `Role Cannot Be ${actionLabel} In Its Current State.`
    );
  }
}

export async function deactivateRole(_auth: AuthContext, roleId: string): Promise<RoleDocument> {
  const role = await getAdminRoleById(roleId);

  // System roles (project_owner, project_user) back every project's onboarding flow —
  // deactivating one would strand new project/member creation platform-wide.
  if (role.isSystem) {
    throw new ValidationError(
      { status: ["System Roles Cannot Be Deactivated."] },
      "System Roles Cannot Be Deactivated."
    );
  }

  assertRoleStatus(role, "active", "Deactivated");

  const isAssigned = await ProjectMember.exists({
    roleId: role._id,
    status: { $in: ["active", "invited"] },
  });

  if (isAssigned) {
    throw new ValidationError(
      { status: ["This Role Is Assigned To A User And Cannot Be Deactivated."] },
      "This Role Is Assigned To A User And Cannot Be Deactivated."
    );
  }

  role.status = "inactive";
  await role.save();

  return role;
}

export async function activateRole(_auth: AuthContext, roleId: string): Promise<RoleDocument> {
  const role = await getAdminRoleById(roleId);

  assertRoleStatus(role, "inactive", "Activated");

  role.status = "active";
  await role.save();

  return role;
}

export async function buildRoleStatusResponse(role: RoleDocument, message: string): Promise<NextResponse> {
  const counts = await resolveRoleMemberCounts([role._id]);
  const membersCount = counts.get(role._id.toString()) ?? 0;

  return ApiResponse.success(serializeAdminRoleDetail(role, membersCount), message);
}
