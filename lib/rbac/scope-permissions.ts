import { hasAnyPermission, isSuperAdmin } from "@/lib/rbac/access";

/** Permissions used to evaluate a scoped route or nav item. */
export function permissionsForScope(
  scope: "platform" | "project",
  platformPermissions: readonly string[],
  projectPermissions: readonly string[],
  roles: readonly string[],
): readonly string[] {
  if (isSuperAdmin(roles)) return platformPermissions;
  if (scope === "platform") return platformPermissions;
  if (projectPermissions.length > 0) return projectPermissions;
  return platformPermissions;
}
