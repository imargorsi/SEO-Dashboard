import { NextResponse } from "next/server";

import { ValidationError } from "@/lib/api/http-errors";
import { ApiResponse } from "@/lib/api/response";
import type { AuthContext } from "@/lib/auth/guards";
import { getAdminRoleById } from "@/lib/roles/get-role";
import { isActiveRoleStatus } from "@/lib/roles/constants";
import { ProjectMember, Role } from "@/models";

/**
 * Hard-delete an inactive custom role.
 * System roles and roles still assigned (active/invited) cannot be deleted.
 */
export async function deleteRole(_auth: AuthContext, roleId: string): Promise<void> {
  const role = await getAdminRoleById(roleId);

  if (role.isSystem) {
    throw new ValidationError(
      { status: ["System Roles Cannot Be Deleted."] },
      "System Roles Cannot Be Deleted.",
    );
  }

  if (isActiveRoleStatus(role.status)) {
    throw new ValidationError(
      { status: ["Only Inactive Roles Can Be Deleted."] },
      "Role Cannot Be Deleted In Its Current State.",
    );
  }

  const isAssigned = await ProjectMember.exists({
    roleId: role._id,
    status: { $in: ["active", "invited"] },
  });

  if (isAssigned) {
    throw new ValidationError(
      { status: ["This Role Is Assigned To A User And Cannot Be Deleted."] },
      "This Role Is Assigned To A User And Cannot Be Deleted.",
    );
  }

  await ProjectMember.deleteMany({ roleId: role._id, status: "removed" });
  await Role.deleteOne({ _id: role._id });
}

export function buildDeleteRoleResponse(): NextResponse {
  return ApiResponse.success(null, "Role Deleted Successfully.");
}
