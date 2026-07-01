import { hasAnyPermission } from "@/lib/frontend/auth/has-any-permission";

const VIEW = ["users.view", "admin.users.view"] as const;
const CREATE = ["users.create", "admin.users.create"] as const;

export function userCanView(permissions: readonly string[] | undefined) {
  return hasAnyPermission(permissions, VIEW);
}

export function userCanCreate(permissions: readonly string[] | undefined) {
  return hasAnyPermission(permissions, CREATE);
}
