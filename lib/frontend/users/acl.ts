import { hasAnyPermission } from "@/lib/frontend/auth/has-any-permission";

const VIEW = ["admin.users.view"] as const;
const CREATE = ["admin.users.create"] as const;
const UPDATE = ["admin.users.update"] as const;
const DELETE = ["admin.users.delete"] as const;

export function userCanView(permissions: readonly string[] | undefined) {
  return hasAnyPermission(permissions, VIEW);
}

export function userCanCreate(permissions: readonly string[] | undefined) {
  return hasAnyPermission(permissions, CREATE);
}

export function userCanUpdate(permissions: readonly string[] | undefined) {
  return hasAnyPermission(permissions, UPDATE);
}

export function userCanDelete(permissions: readonly string[] | undefined) {
  return hasAnyPermission(permissions, DELETE);
}
