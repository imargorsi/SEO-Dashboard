import { NextResponse } from "next/server";

import { ApiResponse } from "@/lib/api/response";
import { ValidationError } from "@/lib/api/http-errors";
import type { AuthContext } from "@/lib/auth/guards";
import { revokeAllUserTokens } from "@/lib/auth/tokens";
import { SUPER_ADMIN_ROLE } from "@/lib/rbac/roles";
import { serializeAdminUserDetail } from "@/lib/serializers/admin-user";
import { getAdminUserById } from "@/lib/users/get-user";
import { isActiveUserStatus, type TUserAccountStatus } from "@/lib/users/constants";
import { User, type UserDocument } from "@/models";

function assertUserAccountStatus(
  user: UserDocument,
  expectedStatus: TUserAccountStatus,
  actionLabel: string,
): void {
  const current = isActiveUserStatus(user.status) ? "active" : "inactive";
  if (current !== expectedStatus) {
    throw new ValidationError(
      { status: [`User Must Be ${expectedStatus === "active" ? "Active" : "Inactive"} To ${actionLabel}.`] },
      `User Cannot Be ${actionLabel} In Its Current State.`,
    );
  }
}

/** Persist status via collection update so a stale HMR schema cannot drop the field. */
async function persistUserStatus(userId: UserDocument["_id"], status: TUserAccountStatus): Promise<void> {
  await User.collection.updateOne({ _id: userId }, { $set: { status, updatedAt: new Date() } });
}

export async function deactivateAdminUser(auth: AuthContext, userId: string): Promise<UserDocument> {
  const user = await getAdminUserById(userId);

  if (user._id.equals(auth.user._id)) {
    throw new ValidationError(
      { status: ["You Cannot Deactivate Your Own Account."] },
      "You Cannot Deactivate Your Own Account.",
    );
  }

  if (user.roles.includes(SUPER_ADMIN_ROLE)) {
    throw new ValidationError({ status: ["This User Cannot Be Deactivated."] }, "This User Cannot Be Deactivated.");
  }

  assertUserAccountStatus(user, "active", "Deactivated");

  await persistUserStatus(user._id, "inactive");
  await revokeAllUserTokens(user._id);

  user.status = "inactive";
  return user;
}

export async function activateAdminUser(_auth: AuthContext, userId: string): Promise<UserDocument> {
  const user = await getAdminUserById(userId);

  assertUserAccountStatus(user, "inactive", "Activated");

  await persistUserStatus(user._id, "active");

  user.status = "active";
  return user;
}

export function buildUserStatusResponse(user: UserDocument, message: string): NextResponse {
  return ApiResponse.success(serializeAdminUserDetail(user), message);
}
