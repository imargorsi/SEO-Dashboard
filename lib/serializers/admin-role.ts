import type { TAdminRoleDetail, TAdminRoleListItem } from "@/types/admin-role.types";
import type { RoleDocument } from "@/models/Role";

export function serializeAdminRoleListItem(role: RoleDocument, membersCount = 0): TAdminRoleListItem {
  return {
    id: role._id.toString(),
    slug: role.slug,
    name: role.name,
    description: role.description ?? "",
    scope: role.scope,
    is_system: role.isSystem,
    status: role.status,
    permissions_count: role.permissions?.length ?? 0,
    members_count: membersCount,
    created_at: role.createdAt.toISOString(),
    updated_at: role.updatedAt.toISOString(),
  };
}

export function serializeAdminRoleDetail(role: RoleDocument, membersCount = 0): TAdminRoleDetail {
  return {
    ...serializeAdminRoleListItem(role, membersCount),
    permissions: role.permissions ? [...role.permissions] : [],
  };
}
