import { allSuperAdminPermissions } from "@/lib/rbac/permission-catalog";
import { PROJECT_OWNER_ROLE, PROJECT_USER_ROLE, SUPER_ADMIN_ROLE } from "@/lib/rbac/roles";

/**
 * Platform RBAC for User.roles (super_admin only).
 * Project roles (project_owner, project_user) live in the roles collection
 * and are assigned per project via project_members — see doc/rbac.md.
 */

export { PROJECT_OWNER_ROLE, PROJECT_USER_ROLE, SUPER_ADMIN_ROLE } from "@/lib/rbac/roles";

const ROLE_PERMISSIONS: Record<string, readonly string[]> = {
  [SUPER_ADMIN_ROLE]: allSuperAdminPermissions(),
};

export function permissionsForRoles(roles: string[]): string[] {
  const names = new Set<string>();
  for (const role of roles) {
    for (const permission of ROLE_PERMISSIONS[role] ?? []) {
      names.add(permission);
    }
  }
  return [...names].sort();
}

export function userHasRole(roles: string[], role: string): boolean {
  return roles.includes(role);
}

export function homeApiPathForRoles(roles: string[]): string | null {
  if (userHasRole(roles, SUPER_ADMIN_ROLE)) return "/api/v1/projects";
  return null;
}
