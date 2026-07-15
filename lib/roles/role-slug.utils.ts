import { normalizeRoleKey } from "@/lib/rbac/roles";
import { Role } from "@/models/Role";

function baseSlugFromName(name: string): string {
  return normalizeRoleKey(name) || "role";
}

/** Generate a unique, immutable role slug from a name (e.g. "Content Manager" -> "content_manager"). */
export async function generateUniqueRoleSlug(name: string, excludeRoleId?: string): Promise<string> {
  const base = baseSlugFromName(name);
  let candidate = base;
  let suffix = 2;

  while (
    await Role.exists({
      slug: candidate,
      ...(excludeRoleId ? { _id: { $ne: excludeRoleId } } : {}),
    })
  ) {
    candidate = `${base}_${suffix}`;
    suffix += 1;
  }

  return candidate;
}
