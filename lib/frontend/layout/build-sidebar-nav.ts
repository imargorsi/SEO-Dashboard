import type { SidebarNavItem } from "@/lib/frontend/layout/sidebar-nav";
import { SIDEBAR_NAV_DEFINITIONS } from "@/lib/frontend/layout/sidebar-nav";
import { hasAnyPermission } from "@/lib/rbac/access";
import { permissionsForScope } from "@/lib/rbac/scope-permissions";

export function buildSidebarNavItems(
  platformPermissions: readonly string[],
  projectPermissions: readonly string[],
  roles: readonly string[],
): SidebarNavItem[] {
  return SIDEBAR_NAV_DEFINITIONS.filter((item) => {
    if (item.viewPermission === null) return true;

    const permissions = permissionsForScope(
      item.permissionScope,
      platformPermissions,
      projectPermissions,
      roles,
    );

    return hasAnyPermission(permissions, [item.viewPermission]);
  }).map(({ viewPermission: _viewPermission, permissionScope: _scope, ...item }) => item);
}

export function hasProjectWorkspace(
  platformPermissions: readonly string[],
  projectPermissions: readonly string[],
  roles: readonly string[],
): boolean {
  const permissions = permissionsForScope(
    "project",
    platformPermissions,
    projectPermissions,
    roles,
  );
  return permissions.some((permission) => permission.endsWith(".view"));
}
