import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { NotFoundError } from "@/lib/api/http-errors";
import { ApiResponse } from "@/lib/api/response";
import { SUPER_ADMIN_ROLE } from "@/lib/rbac/roles";
import { serializeAdminUserDetail } from "@/lib/serializers/admin-user";
import { resolveUserProjectAssignments } from "@/lib/users/resolve-user-project-assignments";
import { User } from "@/models";

export async function getAdminUserById(userId: string) {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new NotFoundError("User");
  }

  const user = await User.findOne({
    _id: userId,
    roles: { $nin: [SUPER_ADMIN_ROLE] },
  }).select("-password");

  if (!user) {
    throw new NotFoundError("User");
  }

  return user;
}

export async function buildGetAdminUserResponse(
  user: Awaited<ReturnType<typeof getAdminUserById>>,
): Promise<NextResponse> {
  const assignments = await resolveUserProjectAssignments([user._id]);
  return ApiResponse.success(serializeAdminUserDetail(user, assignments.get(user._id.toString()) ?? []));
}
