import { hasAnyPermission } from "@/lib/auth/hasAnyPermission"

const VIEW = ["companies.view", "admin.companies.view"] as const
const CREATE = ["companies.create", "admin.companies.create"] as const
const UPDATE = ["companies.update", "admin.companies.update"] as const
const DELETE = ["companies.delete", "admin.companies.delete"] as const

export function companyCanView(permissions: readonly string[] | undefined) {
  return hasAnyPermission(permissions, VIEW)
}

export function companyCanCreate(permissions: readonly string[] | undefined) {
  return hasAnyPermission(permissions, CREATE)
}

export function companyCanUpdate(permissions: readonly string[] | undefined) {
  return hasAnyPermission(permissions, UPDATE)
}

export function companyCanDelete(permissions: readonly string[] | undefined) {
  return hasAnyPermission(permissions, DELETE)
}
