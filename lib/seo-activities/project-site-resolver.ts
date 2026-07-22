import { Project } from "@/models";

/** Case-insensitive match key for sheet Site ↔ project businessName. */
export function normalizeProjectNameKey(value: string): string {
  return value.trim().replace(/\s+/g, " ").toUpperCase();
}

/**
 * Builds Site/project-name → projectId map from non-rejected projects.
 * First project wins if duplicate business names exist.
 */
export async function buildProjectNameResolver(): Promise<Map<string, string>> {
  const projects = await Project.find({
    status: { $ne: "rejected" },
  })
    .select("_id businessName")
    .lean();

  const map = new Map<string, string>();

  for (const project of projects) {
    const key = normalizeProjectNameKey(project.businessName ?? "");
    if (!key) continue;
    if (map.has(key)) continue;
    map.set(key, project._id.toString());
  }

  return map;
}

export function resolveProjectIdForSiteName(
  siteName: string | null,
  resolver: Map<string, string>,
): string | null {
  if (!siteName) return null;
  return resolver.get(normalizeProjectNameKey(siteName)) ?? null;
}
