/**
 * Locked v1 permission catalog — see doc/rbac.md
 *
 * Not in catalog (always allowed for authenticated users):
 * - Profile / edit-profile / change password (Module 12)
 *
 * Deferred (not in v1 matrix):
 * - plan, settings (project settings)
 */

export const PERMISSION_ACTIONS = ["view", "create", "update", "delete"] as const;
export type PermissionAction = (typeof PERMISSION_ACTIONS)[number];

export const MEMBER_PERMISSION_ACTIONS = ["view", "invite", "remove"] as const;
export type MemberPermissionAction = (typeof MEMBER_PERMISSION_ACTIONS)[number];

/** Project-scoped modules in the role matrix (v1). */
export const PROJECT_MODULE_SLUGS = [
  "dashboard",
  "projects",
  "analytics",
  "seo_activities",
  "leads",
  "reports",
  "members",
] as const;

export type ProjectModuleSlug = (typeof PROJECT_MODULE_SLUGS)[number];

export type CrudModuleSlug = Exclude<ProjectModuleSlug, "members">;

export type PermissionModuleDefinition = {
  slug: string;
  label: string;
  actions: readonly string[];
};

export const PROJECT_PERMISSION_MODULES: readonly PermissionModuleDefinition[] = [
  { slug: "dashboard", label: "Dashboard", actions: PERMISSION_ACTIONS },
  { slug: "projects", label: "Projects", actions: PERMISSION_ACTIONS },
  { slug: "analytics", label: "Analytics", actions: PERMISSION_ACTIONS },
  { slug: "seo_activities", label: "SEO Activities", actions: PERMISSION_ACTIONS },
  { slug: "leads", label: "Leads", actions: PERMISSION_ACTIONS },
  { slug: "reports", label: "Reports", actions: PERMISSION_ACTIONS },
  { slug: "members", label: "Members", actions: MEMBER_PERMISSION_ACTIONS },
];

export const ADMIN_MODULE_SLUGS = ["users", "roles"] as const;
export type AdminModuleSlug = (typeof ADMIN_MODULE_SLUGS)[number];

export const ADMIN_PERMISSION_MODULES: readonly PermissionModuleDefinition[] = [
  { slug: "users", label: "Users", actions: PERMISSION_ACTIONS },
  { slug: "roles", label: "Roles", actions: PERMISSION_ACTIONS },
];

export function projectPermission(module: CrudModuleSlug, action: PermissionAction): string {
  return `${module}.${action}`;
}

export function memberPermission(action: MemberPermissionAction): string {
  return `members.${action}`;
}

export function adminPermission(module: AdminModuleSlug, action: PermissionAction): string {
  return `admin.${module}.${action}`;
}

export function allCrudPermissions(module: CrudModuleSlug): string[] {
  return PERMISSION_ACTIONS.map((action) => projectPermission(module, action));
}

export function allMemberPermissions(): string[] {
  return MEMBER_PERMISSION_ACTIONS.map((action) => memberPermission(action));
}

export function allAdminPermissions(): string[] {
  const permissions: string[] = ["admin.dashboard.view"];
  for (const module of ADMIN_MODULE_SLUGS) {
    for (const action of PERMISSION_ACTIONS) {
      permissions.push(adminPermission(module, action));
    }
  }
  return permissions;
}

/** Platform operator — all project modules + admin users/roles management. */
export function allSuperAdminPermissions(): string[] {
  return [...new Set([...allAdminPermissions(), ...allProjectCatalogPermissions()])].sort();
}

export function allProjectCatalogPermissions(): string[] {
  const permissions: string[] = [];
  for (const mod of PROJECT_PERMISSION_MODULES) {
    for (const action of mod.actions) {
      permissions.push(`${mod.slug}.${action}`);
    }
  }
  return permissions;
}

const PROJECT_OWNER_MODULES: readonly CrudModuleSlug[] = [
  "dashboard",
  "projects",
  "analytics",
  "seo_activities",
  "leads",
  "reports",
];

/** Default seeded permissions for `project_owner`. */
export function defaultProjectOwnerPermissions(): string[] {
  const permissions = PROJECT_OWNER_MODULES.flatMap((module) => allCrudPermissions(module));
  return [...permissions, ...allMemberPermissions()];
}

/** Default seeded permissions for `project_user` — view on modules + members.view only. */
export function defaultProjectUserPermissions(): string[] {
  const viewPermissions = PROJECT_OWNER_MODULES.map((module) => projectPermission(module, "view"));
  return [...viewPermissions, memberPermission("view")];
}

export function isKnownPermission(permission: string): boolean {
  return allProjectCatalogPermissions().includes(permission) || allAdminPermissions().includes(permission);
}
