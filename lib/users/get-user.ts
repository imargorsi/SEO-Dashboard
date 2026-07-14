import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { NotFoundError } from "@/lib/api/http-errors";
import { ApiResponse } from "@/lib/api/response";
import { SUPER_ADMIN_ROLE } from "@/lib/rbac/roles";
import { serializeAdminUserDetail } from "@/lib/serializers/admin-user";
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

export function buildGetAdminUserResponse(user: Awaited<ReturnType<typeof getAdminUserById>>): NextResponse {
  return ApiResponse.success(serializeAdminUserDetail(user));
}
