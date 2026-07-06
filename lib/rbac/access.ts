import { SUPER_ADMIN_ROLE } from "@/lib/rbac/roles";

export function isSuperAdmin(roles: readonly string[] | undefined | null): boolean {
  return roles?.includes(SUPER_ADMIN_ROLE) ?? false;
}

export function hasPermission(
  permissions: readonly string[] | undefined | null,
  permission: string,
): boolean {
  return permissions?.includes(permission) ?? false;
}

/** True if `permissions` includes at least one exact string from `candidates`. */
export function hasAnyPermission(
  permissions: readonly string[] | undefined | null,
  candidates: readonly string[],
): boolean {
  if (!permissions?.length || !candidates.length) return false;
  const set = new Set(permissions);
  for (const candidate of candidates) {
    if (set.has(candidate)) return true;
  }
  return false;
}

export function mergePermissions(
  platformPermissions: readonly string[],
  projectPermissions: readonly string[],
): string[] {
  return [...new Set([...platformPermissions, ...projectPermissions])].sort();
}
