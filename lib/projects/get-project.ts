import mongoose from "mongoose";
import { NextResponse } from "next/server";

import { ApiResponse } from "@/lib/api/response";
import type { AuthContext } from "@/lib/auth/guards";
import { serializeProject, type ProjectDetailDto } from "@/lib/serializers/project";
import { resolveOwnerMap } from "@/lib/projects/resolve-project-owner.utils";
import { SUPER_ADMIN_ROLE } from "@/lib/rbac/roles";
import { Project, ProjectMember, type ProjectDocument } from "@/models";

export async function getProjectForUser(
  auth: AuthContext,
  projectId: string,
): Promise<ProjectDocument | null> {
  if (!mongoose.isValidObjectId(projectId)) {
    return null;
  }

  const isAdmin = auth.user.roles.includes(SUPER_ADMIN_ROLE);
  if (isAdmin) {
    return Project.findById(projectId);
  }

  const membership = await ProjectMember.findOne({
    projectId,
    userId: auth.user._id,
    status: "active",
  }).select("_id");

  if (!membership) {
    return null;
  }

  return Project.findById(projectId);
}

export async function getProjectDetailForUser(
  auth: AuthContext,
  projectId: string,
): Promise<ProjectDetailDto | null> {
  const project = await getProjectForUser(auth, projectId);
  if (!project) {
    return null;
  }

  const ownerMap = await resolveOwnerMap([project]);
  return serializeProject(project, ownerMap.get(project._id.toString()));
}

export function buildGetProjectResponse(project: ProjectDetailDto): NextResponse {
  return ApiResponse.success(project);
}
