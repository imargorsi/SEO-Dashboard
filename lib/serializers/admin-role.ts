import type { TAdminRoleListItem } from "@/types/admin-role.types";
import type { RoleDocument } from "@/models/Role";

export function serializeAdminRoleListItem(
  role: RoleDocument,
  membersCount = 0,
): TAdminRoleListItem {
  return {
    id: role._id.toString(),
    slug: role.slug,
    name: role.name,
    description: role.description ?? "",
    scope: role.scope,
    is_system: role.isSystem,
    permissions_count: role.permissions?.length ?? 0,
    members_count: membersCount,
    created_at: role.createdAt.toISOString(),
    updated_at: role.updatedAt.toISOString(),
  };
}
