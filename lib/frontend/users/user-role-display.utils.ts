import {
  PROJECT_OWNER_ROLE,
  PROJECT_USER_ROLE,
  SUPER_ADMIN_ROLE,
} from "@/lib/rbac/roles";

export type TUserRoleBadgeTone = "brand" | "info" | "warning" | "success" | "muted";

const ROLE_TONE_BY_SLUG: Record<string, TUserRoleBadgeTone> = {
  [SUPER_ADMIN_ROLE]: "brand",
  [PROJECT_OWNER_ROLE]: "warning",
  [PROJECT_USER_ROLE]: "success",
};

export function getUserRoleBadgeTone(roleSlug: string): TUserRoleBadgeTone {
  return ROLE_TONE_BY_SLUG[roleSlug] ?? "info";
}

export function formatUserRoleLabel(roleSlug: string): string {
  return roleSlug.replace(/_/g, " ");
}
