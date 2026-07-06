import { hasAnyPermission } from "@/lib/rbac/access";

const VIEW = ["admin.roles.view"] as const;
const CREATE = ["admin.roles.create"] as const;
const UPDATE = ["admin.roles.update"] as const;
const DELETE = ["admin.roles.delete"] as const;

export function roleCanView(permissions: readonly string[] | undefined) {
  return hasAnyPermission(permissions, VIEW);
}

export function roleCanCreate(permissions: readonly string[] | undefined) {
  return hasAnyPermission(permissions, CREATE);
}

export function roleCanUpdate(permissions: readonly string[] | undefined) {
  return hasAnyPermission(permissions, UPDATE);
}

export function roleCanDelete(permissions: readonly string[] | undefined) {
  return hasAnyPermission(permissions, DELETE);
}
