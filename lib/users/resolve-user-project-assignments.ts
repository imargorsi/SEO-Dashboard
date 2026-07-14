import type { Types } from "mongoose";

import type { ProjectMemberStatus, ProjectStatus } from "@/lib/projects/constants";
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
    Role.find({ _id: { $in: roleIds } }).select("slug").lean(),
    Project.find({ _id: { $in: projectIds } }).select("businessName status").lean(),
  ]);

  const slugByRoleId = new Map(roles.map((role) => [role._id.toString(), role.slug]));
  const projectById = new Map(
    projects.map((project) => [
      project._id.toString(),
      {
        name: project.businessName,
        status: project.status as ProjectStatus,
      },
    ]),
  );

  const assignmentsByUserId = new Map<string, TAdminUserProjectAssignment[]>();

  for (const membership of memberships) {
    const project = projectById.get(membership.projectId.toString());
    if (!project) continue;

    const assignment: TAdminUserProjectAssignment = {
      id: membership.projectId.toString(),
      name: project.name,
      status: project.status,
      membership_role: slugByRoleId.get(membership.roleId.toString()) ?? "project_user",
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
