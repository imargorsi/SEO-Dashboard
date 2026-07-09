

import { homeApiPathForRoles } from "@/lib/auth/rbac";
import { serializeProfileImageUrl } from "@/lib/serializers/profile-image";
import type { UserDocument } from "@/models/User";

type UserSerializeOptions = {
  roles: string[];
  permissions: string[];
  includeHomeApiPath?: boolean;
};

export function serializeUser(user: UserDocument, options: UserSerializeOptions) {
  const payload: Record<string, unknown> = {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    profile_image: serializeProfileImageUrl(user.profileImage),
    email_verified_at: user.emailVerifiedAt,
    roles: options.roles,
    permissions: options.permissions,
  };

  if (options.includeHomeApiPath !== false) {
    payload.home_api_path = homeApiPathForRoles(options.roles);
  }

  return payload;
}
