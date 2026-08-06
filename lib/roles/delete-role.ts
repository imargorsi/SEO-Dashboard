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
      { status: ["Cannot delete system role."] },
      "Cannot delete system role.",
    );
  }

  if (isActiveRoleStatus(role.status)) {
    throw new ValidationError(
      { status: ["Only inactive roles deletable."] },
      "Role Cannot Be Deleted In Its Current State.",
    );
  }

  const isAssigned = await ProjectMember.exists({
    roleId: role._id,
    status: { $in: ["active", "invited"] },
  });

  if (isAssigned) {
    throw new ValidationError(
      { status: ["Cannot delete assigned role."] },
      "Cannot delete assigned role.",
    );
  }

  await ProjectMember.deleteMany({ roleId: role._id, status: "removed" });
  await Role.deleteOne({ _id: role._id });
}

export function buildDeleteRoleResponse(): NextResponse {
  return ApiResponse.success(null, "Role deleted.");
}
