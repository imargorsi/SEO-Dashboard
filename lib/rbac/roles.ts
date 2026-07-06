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
