import mongoose from "mongoose";
import { NextResponse } from "next/server";

import { ApiResponse } from "@/lib/api/response";
import type { AuthContext } from "@/lib/auth/guards";
import { serializeProject } from "@/lib/serializers/project";
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

export function buildGetProjectResponse(project: ProjectDocument): NextResponse {
  return ApiResponse.success(serializeProject(project));
}
