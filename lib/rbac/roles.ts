import {
  defaultProjectOwnerPermissions,
  defaultProjectUserPermissions,
} from "@/lib/rbac/permission-catalog";

export const SUPER_ADMIN_ROLE = "super_admin";
export const PROJECT_OWNER_ROLE = "project_owner";
export const PROJECT_USER_ROLE = "project_user";

export type RoleScope = "platform" | "project";

export type SystemRoleSeed = {
  slug: string;
  name: string;
  description: string;
  scope: RoleScope;
  isSystem: true;
  permissions: string[];
};

export const SYSTEM_ROLE_SEEDS: readonly SystemRoleSeed[] = [
  {
    slug: PROJECT_OWNER_ROLE,
    name: "Project Owner",
    description: "Full access to project modules and member management.",
    scope: "project",
    isSystem: true,
    permissions: defaultProjectOwnerPermissions(),
  },
  {
    slug: PROJECT_USER_ROLE,
    name: "Project User",
    description: "View project modules. Cannot invite or remove members by default.",
    scope: "project",
    isSystem: true,
    permissions: defaultProjectUserPermissions(),
  },
];

export const SYSTEM_PROJECT_ROLE_SLUGS = [PROJECT_OWNER_ROLE, PROJECT_USER_ROLE] as const;

/** Hardcoded platform operator — lives on `User.roles` only, never in the roles collection / admin UI. */
export const RESERVED_PLATFORM_ROLE_SLUGS = [SUPER_ADMIN_ROLE] as const;

/** Deprecated Laravel roles that must not appear in v1. */
export const DEPRECATED_ROLE_SLUGS = ["company_admin"] as const;

export const HIDDEN_ADMIN_ROLE_SLUGS = [
  ...RESERVED_PLATFORM_ROLE_SLUGS,
  ...DEPRECATED_ROLE_SLUGS,
] as const;

const RESERVED_PLATFORM_ROLE_SET = new Set<string>(RESERVED_PLATFORM_ROLE_SLUGS);
const SYSTEM_PROJECT_ROLE_SET = new Set<string>(SYSTEM_PROJECT_ROLE_SLUGS);
const DEPRECATED_ROLE_SET = new Set<string>(DEPRECATED_ROLE_SLUGS);
const HIDDEN_ADMIN_ROLE_SET = new Set<string>(HIDDEN_ADMIN_ROLE_SLUGS);

/** Normalize a role name/slug into a comparable underscore key (used for slug generation and reserved-name detection). */
export function normalizeRoleKey(value: string): string {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
  );
}

export function isReservedPlatformRole(slug: string): boolean {
  return RESERVED_PLATFORM_ROLE_SET.has(slug) || RESERVED_PLATFORM_ROLE_SET.has(normalizeRoleKey(slug));
}

export function isSystemProjectRole(slug: string): boolean {
  return SYSTEM_PROJECT_ROLE_SET.has(slug) || SYSTEM_PROJECT_ROLE_SET.has(normalizeRoleKey(slug));
}

export function isDeprecatedRole(slug: string): boolean {
  return DEPRECATED_ROLE_SET.has(slug) || DEPRECATED_ROLE_SET.has(normalizeRoleKey(slug));
}

/** Roles that must never appear in admin roles lists or assignable dropdowns. */
export function isHiddenFromAdminRoleUi(slugOrName: string): boolean {
  const normalized = normalizeRoleKey(slugOrName);
  return HIDDEN_ADMIN_ROLE_SET.has(slugOrName) || HIDDEN_ADMIN_ROLE_SET.has(normalized);
}
