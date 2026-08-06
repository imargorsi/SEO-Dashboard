import { NextResponse } from "next/server";

import { ValidationError } from "@/lib/api/http-errors";
import { ApiResponse } from "@/lib/api/response";
import type { AuthContext } from "@/lib/auth/guards";
import { revokeAllUserTokens } from "@/lib/auth/tokens";
import { deleteStoredProfileImage } from "@/lib/auth/profile-image-storage";
import { SUPER_ADMIN_ROLE } from "@/lib/rbac/roles";
import { getAdminUserById } from "@/lib/users/get-user";
import { isActiveUserStatus } from "@/lib/users/constants";
import { ProjectMember, User } from "@/models";

/**
 * Hard-delete an inactive admin-managed user.
 * Blocks self-delete and `super_admin` targets; cascades memberships and tokens.
 */
export async function deleteAdminUser(auth: AuthContext, userId: string): Promise<void> {
  const user = await getAdminUserById(userId);

  if (user._id.equals(auth.user._id)) {
    throw new ValidationError(
      { status: ["You Cannot Delete Your Own Account."] },
      "You Cannot Delete Your Own Account.",
    );
  }

  if (user.roles.includes(SUPER_ADMIN_ROLE)) {
    throw new ValidationError({ status: ["Cannot delete user."] }, "Cannot delete user.");
  }

  if (isActiveUserStatus(user.status)) {
    throw new ValidationError(
      { status: ["Only inactive users deletable."] },
      "User Cannot Be Deleted In Its Current State.",
    );
  }

  const profileImage = user.profileImage;
  const id = user._id;

  await revokeAllUserTokens(id);
  await ProjectMember.deleteMany({ userId: id });
  await User.deleteOne({ _id: id });
  await deleteStoredProfileImage(profileImage).catch(() => undefined);
}

export function buildDeleteAdminUserResponse(): NextResponse {
  return ApiResponse.success(null, "User deleted.");
}
