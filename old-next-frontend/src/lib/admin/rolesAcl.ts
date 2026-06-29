import { hasAnyPermission } from "@/lib/auth/hasAnyPermission"

const VIEW = ["roles.view", "admin.roles.view"] as const
const CREATE = ["roles.create", "admin.roles.create"] as const
const UPDATE = ["roles.update", "admin.roles.update"] as const
const DELETE = ["roles.delete", "admin.roles.delete"] as const

export function roleCanView(permissions: readonly string[] | undefined) {
  return hasAnyPermission(permissions, VIEW)
}

export function roleCanCreate(permissions: readonly string[] | undefined) {
  return hasAnyPermission(permissions, CREATE)
}

export function roleCanUpdate(permissions: readonly string[] | undefined) {
  return hasAnyPermission(permissions, UPDATE)
}

export function roleCanDelete(permissions: readonly string[] | undefined) {
  return hasAnyPermission(permissions, DELETE)
}
