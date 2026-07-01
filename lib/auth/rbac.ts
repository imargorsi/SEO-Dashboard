/** Auth-only role → permission map. Full RBAC collections ship with Module 4. */

export const SUPER_ADMIN_ROLE = "super_admin";
export const COMPANY_ADMIN_ROLE = "company_admin";

const ADMIN_PERMISSIONS = [
  "admin.dashboard.view",
  "admin.companies.view",
  "admin.companies.create",
  "admin.companies.update",
  "admin.companies.delete",
  "admin.users.view",
  "admin.users.create",
  "admin.roles.view",
  "admin.roles.create",
  "admin.roles.update",
  "admin.roles.delete",
  "admin.permissions.view",
  "admin.permissions.create",
  "admin.permissions.update",
  "admin.permissions.delete",
] as const;

const COMPANY_ADMIN_PERMISSIONS = [
  "company.dashboard.view",
  "company.profile.view",
  "company.profile.update",
] as const;

const ROLE_PERMISSIONS: Record<string, readonly string[]> = {
  [SUPER_ADMIN_ROLE]: ADMIN_PERMISSIONS,
  [COMPANY_ADMIN_ROLE]: COMPANY_ADMIN_PERMISSIONS,
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
  if (userHasRole(roles, SUPER_ADMIN_ROLE)) return "/api/v1/admin/dashboard";
  if (userHasRole(roles, COMPANY_ADMIN_ROLE)) return "/api/v1/company/dashboard";
  return null;
}
