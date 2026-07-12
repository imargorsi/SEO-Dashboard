import { ProjectMember } from "@/models/ProjectMember";
import { Role } from "@/models/Role";
import type { Types } from "mongoose";

export async function resolveUserProjectRoleSlugs(
  userIds: Array<Types.ObjectId | string>,
): Promise<Map<string, string[]>> {
  if (userIds.length === 0) return new Map();

  const memberships = await ProjectMember.find({
    userId: { $in: userIds },
    status: "active",
  })
    .select("userId roleId")
    .lean();

  if (memberships.length === 0) return new Map();

  const roleIds = [...new Set(memberships.map((membership) => membership.roleId.toString()))];
  const roles = await Role.find({ _id: { $in: roleIds } })
    .select("slug")
    .lean();
  const slugByRoleId = new Map(roles.map((role) => [role._id.toString(), role.slug]));

  const slugsByUserId = new Map<string, Set<string>>();

  for (const membership of memberships) {
    const slug = slugByRoleId.get(membership.roleId.toString());
    if (!slug) continue;

    const userId = membership.userId.toString();
    const existing = slugsByUserId.get(userId) ?? new Set<string>();
    existing.add(slug);
    slugsByUserId.set(userId, existing);
  }

  return new Map(
    [...slugsByUserId.entries()].map(([userId, slugs]) => [userId, [...slugs].sort()]),
  );
}
