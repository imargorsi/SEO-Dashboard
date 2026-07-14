import {
  HIDDEN_ADMIN_ROLE_SLUGS,
  isHiddenFromAdminRoleUi,
} from "@/lib/rbac/roles";
import { Role } from "@/models/Role";

/**
 * Remove reserved/deprecated Role documents that must never live in the roles collection
 * (`super_admin`, `company_admin`). Matches by slug or name (normalized).
 */
export async function purgeHiddenAdminRoles(): Promise<void> {
  const hiddenKeys = [...HIDDEN_ADMIN_ROLE_SLUGS];
  const namePattern = `^(${hiddenKeys.map((slug) => slug.replace(/_/g, "[_\\s-]*")).join("|")})$`;

  await Role.deleteMany({
    $or: [
      { slug: { $in: hiddenKeys } },
      { name: { $regex: namePattern, $options: "i" } },
    ],
  });
}

export function filterVisibleAdminRoles<T extends { slug: string; name: string }>(roles: T[]): T[] {
  return roles.filter(
    (role) => !isHiddenFromAdminRoleUi(role.slug) && !isHiddenFromAdminRoleUi(role.name),
  );
}
