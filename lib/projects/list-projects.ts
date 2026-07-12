import { NextResponse } from "next/server";
import type { Types } from "mongoose";

import { ApiResponse } from "@/lib/api/response";
import type { AuthContext } from "@/lib/auth/guards";
import { serializeProfileImageUrl } from "@/lib/serializers/profile-image";
import { serializeProjectListItem, type ProjectListItemDto } from "@/lib/serializers/project";
import type { ProjectStatus } from "@/lib/projects/constants";
import { PROJECT_OWNER_ROLE, SUPER_ADMIN_ROLE } from "@/lib/rbac/roles";
import { Project, ProjectMember, Role, User, type ProjectDocument } from "@/models";

type ProjectOwnerSummary = {
  id: string;
  name: string;
  profileImage: string | null;
};

async function resolveOwnerMap(projects: ProjectDocument[]): Promise<Map<string, ProjectOwnerSummary>> {
  if (projects.length === 0) return new Map();

  const ownerRole = await Role.findOne({ slug: PROJECT_OWNER_ROLE }).select("_id");
  if (!ownerRole) return new Map();

  const projectIds = projects.map((project) => project._id);
  const ownerMembers = await ProjectMember.find({
    projectId: { $in: projectIds },
    roleId: ownerRole._id,
    status: "active",
  })
    .sort({ createdAt: 1 })
    .select("projectId userId");

  const firstOwnerByProject = new Map<string, Types.ObjectId>();
  for (const member of ownerMembers) {
    const key = member.projectId.toString();
    if (!firstOwnerByProject.has(key)) {
      firstOwnerByProject.set(key, member.userId);
    }
  }

  const ownerUserIds = [...new Set([...firstOwnerByProject.values()].map((id) => id.toString()))];
  if (ownerUserIds.length === 0) return new Map();

  const owners = await User.find({ _id: { $in: ownerUserIds } }).select("_id name profileImage");
  const ownerById = new Map(
    owners.map((owner) => [
      owner._id.toString(),
      {
        id: owner._id.toString(),
        name: owner.name,
        profileImage: serializeProfileImageUrl(owner.profileImage),
      },
    ]),
  );

  const ownerMap = new Map<string, ProjectOwnerSummary>();
  for (const [projectId, ownerUserId] of firstOwnerByProject.entries()) {
    const owner = ownerById.get(ownerUserId.toString());
    if (owner) {
      ownerMap.set(projectId, owner);
    }
  }

  return ownerMap;
}

export type ListProjectsOptions = {
  status?: ProjectStatus;
};

export async function listProjects(
  auth: AuthContext,
  options: ListProjectsOptions = {},
): Promise<ProjectListItemDto[]> {
  const isAdmin = auth.user.roles.includes(SUPER_ADMIN_ROLE);
  const statusFilter = options.status ? { status: options.status } : {};

  let projects: ProjectDocument[];
  if (isAdmin) {
    projects = await Project.find(statusFilter).sort({ createdAt: -1 });
  } else {
    const memberships = await ProjectMember.find({
      userId: auth.user._id,
      status: "active",
    }).select("projectId");

    const projectIds = memberships.map((membership) => membership.projectId);
    if (projectIds.length === 0) {
      return [];
    }

    projects = await Project.find({ _id: { $in: projectIds }, ...statusFilter }).sort({ createdAt: -1 });
  }

  const ownerMap = await resolveOwnerMap(projects);
  return projects.map((project) => serializeProjectListItem(project, ownerMap.get(project._id.toString())));
}

export function buildListProjectsResponse(projects: ProjectListItemDto[]): NextResponse {
  return ApiResponse.success({
    items: projects,
  });
}
