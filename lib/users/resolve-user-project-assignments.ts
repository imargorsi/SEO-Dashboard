import type { Types } from "mongoose";

import type { ProjectMemberStatus, ProjectStatus } from "@/lib/projects/constants";
import { serializeStoredImageUrl } from "@/lib/serializers/stored-image";
import type { TAdminUserProjectAssignment } from "@/types/admin-user.types";
import { Project } from "@/models/Project";
import { ProjectMember } from "@/models/ProjectMember";
import { Role } from "@/models/Role";

export async function resolveUserProjectAssignments(
  userIds: Array<Types.ObjectId | string>,
): Promise<Map<string, TAdminUserProjectAssignment[]>> {
  if (userIds.length === 0) return new Map();

  const memberships = await ProjectMember.find({
    userId: { $in: userIds },
    status: { $in: ["active", "invited"] },
  })
    .select("userId projectId roleId status")
    .lean();

  if (memberships.length === 0) return new Map();

  const roleIds = [...new Set(memberships.map((membership) => membership.roleId.toString()))];
  const projectIds = [...new Set(memberships.map((membership) => membership.projectId.toString()))];

  const [roles, projects] = await Promise.all([
    Role.find({ _id: { $in: roleIds } }).select("slug name").lean(),
    Project.find({ _id: { $in: projectIds } }).select("businessName websiteUrl logoImage status").lean(),
  ]);

  const roleById = new Map(
    roles.map((role) => [role._id.toString(), { slug: role.slug, name: role.name }]),
  );
  const projectById = new Map(
    projects.map((project) => [
      project._id.toString(),
      {
        name: project.businessName,
        websiteUrl: project.websiteUrl,
        logoImage: project.logoImage,
        status: project.status as ProjectStatus,
      },
    ]),
  );

  const assignmentsByUserId = new Map<string, TAdminUserProjectAssignment[]>();

  for (const membership of memberships) {
    const project = projectById.get(membership.projectId.toString());
    if (!project) continue;

    const role = roleById.get(membership.roleId.toString());
    const assignment: TAdminUserProjectAssignment = {
      id: membership.projectId.toString(),
      name: project.name,
      website_url: project.websiteUrl,
      image_url: serializeStoredImageUrl(project.logoImage),
      status: project.status,
      role_id: membership.roleId.toString(),
      role_name: role?.name ?? "Project User",
      membership_role: role?.slug ?? "project_user",
      membership_status: membership.status as ProjectMemberStatus,
    };

    const userId = membership.userId.toString();
    const existing = assignmentsByUserId.get(userId) ?? [];
    existing.push(assignment);
    assignmentsByUserId.set(userId, existing);
  }

  for (const [userId, assignments] of assignmentsByUserId) {
    assignments.sort((a, b) => a.name.localeCompare(b.name));
    assignmentsByUserId.set(userId, assignments);
  }

  return assignmentsByUserId;
}
