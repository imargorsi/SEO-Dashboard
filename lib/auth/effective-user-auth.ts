import type { UserDocument } from "@/models/User";
import { permissionsForRoles } from "@/lib/auth/rbac";

type EffectiveAuthData = {
  roles: string[];
  permissions: string[];
};

/** Platform identity only — `User.roles` (e.g. `super_admin`). Project roles come from `GET /projects/{id}/access`. */
export async function loadPlatformUserAuthData(user: UserDocument): Promise<EffectiveAuthData> {
  const platformRoles = user.roles ?? [];
  const platformPermissions = permissionsForRoles(platformRoles);

  return {
    roles: [...new Set(platformRoles)].sort(),
    permissions: [...new Set(platformPermissions)].sort(),
  };
}

/** @deprecated Use `loadPlatformUserAuthData`. Kept for internal call sites during migration. */
export const loadEffectiveUserAuthData = loadPlatformUserAuthData;
