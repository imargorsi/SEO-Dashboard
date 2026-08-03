import { ValidationError } from "@/lib/api/http-errors";
import { allProjectCatalogPermissions, isKnownPermission } from "@/lib/rbac/permission-catalog";

/** Keep only permission strings that exist in the locked project catalog. */
export function sanitizeProjectPermissions(permissions: string[]): string[] {
  return [...new Set(permissions.filter((permission) => isKnownPermission(permission)))];
}

/** Reject any permission string outside the project catalog — `admin.*` is never assignable to a role. */
export function assertKnownPermissions(permissions: string[]): void {
  const allowed = new Set(allProjectCatalogPermissions());
  const unknown = permissions.filter((permission) => !allowed.has(permission));

  if (unknown.length > 0) {
    throw ValidationError.fromFieldErrors({
      permissions: [`Unknown Permission(s): ${unknown.join(", ")}.`],
    });
  }
}
