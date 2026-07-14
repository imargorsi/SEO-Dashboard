import { NextResponse } from "next/server";

import { ApiResponse } from "@/lib/api/response";
import { SUPER_ADMIN_ROLE } from "@/lib/rbac/roles";
import { serializeStoredImageUrl } from "@/lib/serializers/stored-image";
import type { LookupUsersQueryInput } from "@/schemas/invite-project-member";
import type { TUserLookupItem } from "@/types/project-invite.types";
import { User } from "@/models";

export type { TUserLookupItem };

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Lightweight user search for invite UIs (name or email).
 * Excludes platform admins and the requesting user.
 */
export async function lookupUsersForInvite(
  query: LookupUsersQueryInput,
  options: { excludeUserId?: string; excludeUserIds?: string[] },
): Promise<TUserLookupItem[]> {
  const pattern = escapeRegex(query.search);
  const excludeIds = [
    ...(options.excludeUserId ? [options.excludeUserId] : []),
    ...(options.excludeUserIds ?? []),
  ].filter(Boolean);

  const users = await User.find({
    roles: { $nin: [SUPER_ADMIN_ROLE] },
    emailVerifiedAt: { $ne: null },
    status: { $ne: "inactive" },
    ...(excludeIds.length > 0 ? { _id: { $nin: excludeIds } } : {}),
    $or: [{ name: { $regex: pattern, $options: "i" } }, { email: { $regex: pattern, $options: "i" } }],
  })
    .select("_id name email profileImage")
    .sort({ name: 1 })
    .limit(query.limit);

  return users.map((user) => ({
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    profileImage: serializeStoredImageUrl(user.profileImage),
  }));
}

export function buildLookupUsersResponse(items: TUserLookupItem[]): NextResponse {
  return ApiResponse.success({ items });
}
