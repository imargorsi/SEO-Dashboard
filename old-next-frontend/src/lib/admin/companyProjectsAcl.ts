import { hasAnyPermission } from "@/lib/auth/hasAnyPermission"

const COMPANY_PROJECTS_CREATE = [
  "companyprojects.create",
  "admin.companyProjects.create",
] as const

/** Super-admin: manage projects from the companies table. */
export function companyProjectsCanCreate(
  permissions: readonly string[] | undefined,
) {
  return hasAnyPermission(permissions, COMPANY_PROJECTS_CREATE)
}
