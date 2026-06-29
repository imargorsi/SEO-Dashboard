import { hasAnyPermission } from "@/lib/auth/hasAnyPermission"

const VIEW = ["projects.view", "admin.projects.view"] as const
const CREATE = ["projects.create", "admin.projects.create"] as const
const UPDATE = ["projects.update", "admin.projects.update"] as const
const DELETE = ["projects.delete", "admin.projects.delete"] as const

export function projectCanView(permissions: readonly string[] | undefined) {
  return hasAnyPermission(permissions, VIEW)
}

export function projectCanCreate(permissions: readonly string[] | undefined) {
  return hasAnyPermission(permissions, CREATE)
}

export function projectCanUpdate(permissions: readonly string[] | undefined) {
  return hasAnyPermission(permissions, UPDATE)
}

export function projectCanDelete(permissions: readonly string[] | undefined) {
  return hasAnyPermission(permissions, DELETE)
}
