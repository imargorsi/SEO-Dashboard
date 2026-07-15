import { ValidationError } from "@/lib/api/http-errors";
import { isActiveRoleStatus } from "@/lib/roles/constants";
import { Role, type RoleDocument } from "@/models/Role";

export async function resolveProjectRoleBySlug(slug: string): Promise<RoleDocument> {
  const role = await Role.findOne({ slug, scope: "project" });
  if (!role) {
    throw new Error(`Project role not found: ${slug}`);
  }

  if (!isActiveRoleStatus(role.status)) {
    throw ValidationError.fromFieldErrors({
      role: ["This Role Is Inactive And Cannot Be Assigned."],
    });
  }

  return role;
}
