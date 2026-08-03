/**
 * Locked permission catalog — see doc/rbac.md
 *
 * Project role matrix (system + custom templates):
 * - Dashboard / Analytics / Leads: view only (mutate hidden until features exist)
 * - Projects / SEO Activities: view, create, update, delete
 * - Integrations (Settings → Google link for selected project): view, disconnect, refresh, update
 * - Members: view, invite, remove
 *
 * Platform `admin.*` keys are for `super_admin` evaluation only — never on project Role documents.
 *
 * Not in catalog (always allowed for authenticated users):
 * - Profile / edit-profile / change password (Module 12)
 *
 * Out of scope for this product: packaged Client Reports (handled separately — not a module here).
 */

export const PERMISSION_ACTIONS = ["view", "create", "update", "delete"] as const;
export type PermissionAction = (typeof PERMISSION_ACTIONS)[number];

export const MEMBER_PERMISSION_ACTIONS = ["view", "invite", "remove"] as const;
export type MemberPermissionAction = (typeof MEMBER_PERMISSION_ACTIONS)[number];

export const INTEGRATION_PERMISSION_ACTIONS = ["view", "disconnect", "refresh", "update"] as const;
export type IntegrationPermissionAction = (typeof INTEGRATION_PERMISSION_ACTIONS)[number];

export const VIEW_ONLY_ACTIONS = ["view"] as const;

/** Project-scoped modules in the role matrix. */
export const PROJECT_MODULE_SLUGS = [
  "dashboard",
  "projects",
  "analytics",
  "seo_activities",
  "leads",
  "integrations",
  "members",
] as const;

export type ProjectModuleSlug = (typeof PROJECT_MODULE_SLUGS)[number];

export type CrudModuleSlug = Exclude<ProjectModuleSlug, "members" | "integrations">;

export type PermissionModuleDefinition = {
  slug: string;
  label: string;
  actions: readonly string[];
};

export const PROJECT_PERMISSION_MODULES: readonly PermissionModuleDefinition[] = [
  { slug: "dashboard", label: "Dashboard", actions: VIEW_ONLY_ACTIONS },
  { slug: "projects", label: "Projects", actions: PERMISSION_ACTIONS },
  { slug: "analytics", label: "Analytics", actions: VIEW_ONLY_ACTIONS },
  { slug: "seo_activities", label: "SEO Activities", actions: PERMISSION_ACTIONS },
  { slug: "leads", label: "Leads", actions: VIEW_ONLY_ACTIONS },
  { slug: "integrations", label: "Integrations", actions: INTEGRATION_PERMISSION_ACTIONS },
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

export function integrationPermission(action: IntegrationPermissionAction): string {
  return `integrations.${action}`;
}

export function adminPermission(module: AdminModuleSlug, action: PermissionAction): string {
  return `admin.${module}.${action}`;
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

/** Default seeded permissions for `project_owner` — full project matrix. */
export function defaultProjectOwnerPermissions(): string[] {
  return allProjectCatalogPermissions();
}

/** Default seeded permissions for `project_user` — view on every project module. */
export function defaultProjectUserPermissions(): string[] {
  return PROJECT_PERMISSION_MODULES.map((mod) => `${mod.slug}.view`);
}

export function isKnownPermission(permission: string): boolean {
  return allProjectCatalogPermissions().includes(permission) || allAdminPermissions().includes(permission);
}
