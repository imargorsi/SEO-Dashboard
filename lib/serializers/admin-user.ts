import type { TAdminUserDetail, TAdminUserListItem, TAdminUserProjectAssignment } from "@/types/admin-user.types";
import { serializeStoredImageUrl } from "@/lib/serializers/stored-image";
import type { TUserAccountStatus } from "@/lib/users/constants";
import type { UserDocument } from "@/models/User";

function serializeUserStatus(user: UserDocument): TUserAccountStatus {
  return (user.status ?? "active") as TUserAccountStatus;
}

export function serializeAdminUserListItem(
  user: UserDocument,
  projects: TAdminUserProjectAssignment[] = [],
): TAdminUserListItem {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    profile_image: serializeStoredImageUrl(user.profileImage),
    status: serializeUserStatus(user),
    email_verified_at: user.emailVerifiedAt ? user.emailVerifiedAt.toISOString() : null,
    projects,
    created_at: user.createdAt.toISOString(),
    updated_at: user.updatedAt.toISOString(),
  };
}

export function serializeAdminUserDetail(user: UserDocument): TAdminUserDetail {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    profile_image: serializeStoredImageUrl(user.profileImage),
    status: serializeUserStatus(user),
    email_verified_at: user.emailVerifiedAt ? user.emailVerifiedAt.toISOString() : null,
    created_at: user.createdAt.toISOString(),
    updated_at: user.updatedAt.toISOString(),
  };
}
