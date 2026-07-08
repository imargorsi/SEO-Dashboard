import { NextResponse } from "next/server";

import { ApiResponse } from "@/lib/api/response";
import type { AuthContext } from "@/lib/auth/guards";
import { serializeProjectListItem } from "@/lib/serializers/project";
import { SUPER_ADMIN_ROLE } from "@/lib/rbac/roles";
import { Project, ProjectMember, type ProjectDocument } from "@/models";

export async function listProjects(auth: AuthContext): Promise<ProjectDocument[]> {
  const isAdmin = auth.user.roles.includes(SUPER_ADMIN_ROLE);

  if (isAdmin) {
    return Project.find().sort({ createdAt: -1 });
  }

  const memberships = await ProjectMember.find({
    userId: auth.user._id,
    status: "active",
  }).select("projectId");

  const projectIds = memberships.map((membership) => membership.projectId);
  if (projectIds.length === 0) {
    return [];
  }

  return Project.find({ _id: { $in: projectIds } }).sort({ createdAt: -1 });
}

export function buildListProjectsResponse(projects: ProjectDocument[]): NextResponse {
  return ApiResponse.success({
    items: projects.map(serializeProjectListItem),
  });
}
