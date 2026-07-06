import { Role, type RoleDocument } from "@/models/Role";

export async function resolveProjectRoleBySlug(slug: string): Promise<RoleDocument> {
  const role = await Role.findOne({ slug, scope: "project" });
  if (!role) {
    throw new Error(`Project role not found: ${slug}`);
  }
  return role;
}
