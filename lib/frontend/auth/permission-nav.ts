/** i18n keys under `nav` for known modules */
export type NavLabelKey =
  | "dashboard"
  | "companies"
  | "roles"
  | "permissions"
  | "users"
  | "projects";

export type SidebarNavItem = {
  permission: string;
  path: string;
  labelKey: NavLabelKey;
  fallbackLabel: string;
};

export const SUPER_ADMIN_ROLE = "super_admin";

export function userHasRole(roles: string[], role: string): boolean {
  const needle = role.trim().toLowerCase();
  return roles.some((r) => r.trim().toLowerCase() === needle);
}

export function isSuperAdmin(roles: string[]): boolean {
  return userHasRole(roles, SUPER_ADMIN_ROLE);
}

const KNOWN_VIEW_NAV: Record<string, { path: string; labelKey: NavLabelKey }> = {
  "dashboard.view": { path: "/dashboard", labelKey: "dashboard" },
  "admin.dashboard.view": { path: "/dashboard", labelKey: "dashboard" },
  "companies.view": { path: "/companies", labelKey: "companies" },
  "admin.companies.view": { path: "/companies", labelKey: "companies" },
  "roles.view": { path: "/roles", labelKey: "roles" },
  "admin.roles.view": { path: "/roles", labelKey: "roles" },
  "permissions.view": { path: "/permissions", labelKey: "permissions" },
  "admin.permissions.view": { path: "/permissions", labelKey: "permissions" },
  "users.view": { path: "/users", labelKey: "users" },
  "admin.users.view": { path: "/users", labelKey: "users" },
  "projects.view": { path: "/projects", labelKey: "projects" },
  "admin.projects.view": { path: "/projects", labelKey: "projects" },
};

function titleCaseSegment(segment: string): string {
  if (!segment) return segment;
  return segment
    .split(/[-_]/g)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

export function humanizeViewPermission(permission: string): string {
  const trimmed = permission.trim();
  const lower = trimmed.toLowerCase();
  if (!lower.endsWith(".view")) return titleCaseSegment(trimmed);
  const without = trimmed.slice(0, -".view".length);
  const lastDot = without.lastIndexOf(".");
  const segment = lastDot >= 0 ? without.slice(lastDot + 1) : without;
  return titleCaseSegment(segment);
}

export function buildSidebarNavFromPermissions(
  permissions: string[],
  roles: string[] = [],
): SidebarNavItem[] {
  const hideProjectsModule = isSuperAdmin(roles);
  const seenPath = new Set<string>();
  const out: SidebarNavItem[] = [];

  for (const permission of permissions) {
    if (!permission.toLowerCase().endsWith(".view")) continue;

    const known = KNOWN_VIEW_NAV[permission];
    if (!known) continue;
    if (hideProjectsModule && known.labelKey === "projects") continue;
    if (seenPath.has(known.path)) continue;

    seenPath.add(known.path);
    out.push({
      permission,
      path: known.path,
      labelKey: known.labelKey,
      fallbackLabel: humanizeViewPermission(permission),
    });
  }

  return out;
}
