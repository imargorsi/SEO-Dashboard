import { NextResponse } from "next/server";

import { ApiResponse } from "@/lib/api/response";
import type { AuthContext } from "@/lib/auth/guards";
import { serializeProjectListItem, type ProjectListItemDto } from "@/lib/serializers/project";
import type { ProjectStatus } from "@/lib/projects/constants";
import { resolveProjectIntegrationsMap } from "@/lib/projects/resolve-project-integrations.utils";
import { resolveOwnerMap } from "@/lib/projects/resolve-project-owner.utils";
import { SUPER_ADMIN_ROLE } from "@/lib/rbac/roles";
import { Project, ProjectMember, type ProjectDocument } from "@/models";

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

  const [ownerMap, integrationsMap] = await Promise.all([
    resolveOwnerMap(projects),
    resolveProjectIntegrationsMap(projects.map((project) => project._id)),
  ]);

  return projects.map((project) => {
    const id = project._id.toString();
    return serializeProjectListItem(project, ownerMap.get(id), integrationsMap.get(id));
  });
}

export function buildListProjectsResponse(projects: ProjectListItemDto[]): NextResponse {
  return ApiResponse.success({
    items: projects,
  });
}
