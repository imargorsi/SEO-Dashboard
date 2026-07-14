import { isKnownPermission } from "@/lib/rbac/permission-catalog";
import { SYSTEM_ROLE_SEEDS } from "@/lib/rbac/roles";
import { purgeHiddenAdminRoles } from "@/lib/rbac/purge-hidden-admin-roles";
import { Role } from "@/models/Role";

export async function seedSystemRoles(): Promise<void> {
  await purgeHiddenAdminRoles();

  for (const seed of SYSTEM_ROLE_SEEDS) {
    for (const permission of seed.permissions) {
      if (!isKnownPermission(permission)) {
        throw new Error(`Unknown permission in seed for ${seed.slug}: ${permission}`);
      }
    }

    await Role.findOneAndUpdate(
      { slug: seed.slug },
      {
        slug: seed.slug,
        name: seed.name,
        description: seed.description,
        scope: seed.scope,
        isSystem: seed.isSystem,
        permissions: seed.permissions,
      },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
    );
  }
}
