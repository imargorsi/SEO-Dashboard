import {
  INTEGRATION_PERMISSION_ACTIONS,
  integrationPermission,
  isKnownPermission,
} from "@/lib/rbac/permission-catalog";
import { PROJECT_OWNER_ROLE, PROJECT_USER_ROLE, SYSTEM_ROLE_SEEDS } from "@/lib/rbac/roles";
import { purgeHiddenAdminRoles } from "@/lib/rbac/purge-hidden-admin-roles";
import { Role } from "@/models/Role";

/** Process-local memo so existing DBs pick up catalog backfills without requiring `npm run seed` on every deploy. */
let ensurePromise: Promise<void> | null = null;

/**
 * Runs {@link seedSystemRoles} once per process (retries after failure).
 * Call from project-access paths so Integrations backfill applies before permission checks.
 */
export async function ensureSystemRoles(): Promise<void> {
  if (!ensurePromise) {
    ensurePromise = seedSystemRoles().catch((error) => {
      ensurePromise = null;
      throw error;
    });
  }
  await ensurePromise;
}

/**
 * Ensures system role templates exist.
 * - Insert: full seed including permissions.
 * - Update: identity fields only — do not clobber admin-edited permissions.
 * - System roles: backfill Integrations keys added to the catalog after initial seed.
 * - All roles: strip permission strings removed from the locked catalog (e.g. after a matrix trim).
 */
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
        $set: {
          slug: seed.slug,
          name: seed.name,
          description: seed.description,
          scope: seed.scope,
          isSystem: seed.isSystem,
        },
        $setOnInsert: {
          permissions: seed.permissions,
        },
      },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
    );
  }

  // Existing DBs used $setOnInsert only — add Integrations without replacing edited arrays.
  const ownerIntegrations = INTEGRATION_PERMISSION_ACTIONS.map((action) =>
    integrationPermission(action),
  );
  await Role.updateOne(
    { slug: PROJECT_OWNER_ROLE },
    { $addToSet: { permissions: { $each: ownerIntegrations } } },
  );
  await Role.updateOne(
    { slug: PROJECT_USER_ROLE },
    { $addToSet: { permissions: { $each: [integrationPermission("view")] } } },
  );

  // Drop catalog-removed keys so role edit saves are not blocked after a matrix trim.
  const roles = await Role.find({}).select("_id permissions");
  for (const role of roles) {
    const next = role.permissions.filter((permission) => isKnownPermission(permission));
    if (next.length !== role.permissions.length) {
      role.permissions = next;
      await role.save();
    }
  }
}
