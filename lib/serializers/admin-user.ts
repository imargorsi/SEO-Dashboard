import { SUPER_ADMIN_ROLE } from "@/lib/rbac/roles";
import type { TAdminUserListItem } from "@/types/admin-user.types";
import type { UserDocument } from "@/models/User";

export function serializeAdminUserListItem(
  user: UserDocument,
  projectRoleSlugs: string[] = [],
): TAdminUserListItem {
  const platformRoles = (user.roles ?? []).filter((role) => role !== SUPER_ADMIN_ROLE);
  const roles = [...new Set([...platformRoles, ...projectRoleSlugs])].sort();

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    email_verified_at: user.emailVerifiedAt ? user.emailVerifiedAt.toISOString() : null,
    roles,
    created_at: user.createdAt.toISOString(),
    updated_at: user.updatedAt.toISOString(),
  };
}
