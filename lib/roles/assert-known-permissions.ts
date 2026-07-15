import { ValidationError } from "@/lib/api/http-errors";
import { allProjectCatalogPermissions } from "@/lib/rbac/permission-catalog";

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
