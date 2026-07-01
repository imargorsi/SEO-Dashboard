import { hasAnyPermission } from "@/lib/frontend/auth/has-any-permission";

const COMPANY_PROJECTS_CREATE = [
  "company.projects.create",
  "admin.company.projects.create",
  "projects.create",
  "admin.projects.create",
] as const;

export function companyProjectsCanCreate(permissions: readonly string[] | undefined) {
  return hasAnyPermission(permissions, COMPANY_PROJECTS_CREATE);
}
