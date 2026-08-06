import mongoose from "mongoose";
import { NextResponse } from "next/server";

import { NotFoundError, ValidationError } from "@/lib/api/http-errors";
import { ApiResponse } from "@/lib/api/response";
import type { AuthContext } from "@/lib/auth/guards";
import { deleteStoredProjectLogo } from "@/lib/projects/project-logo-storage";
import { Project, ProjectMember, SeoActivity, type ProjectDocument } from "@/models";

async function findProjectOrThrow(projectId: string): Promise<ProjectDocument> {
  if (!mongoose.isValidObjectId(projectId)) {
    throw new NotFoundError("Project");
  }

  const project = await Project.findById(projectId);
  if (!project) {
    throw new NotFoundError("Project");
  }

  return project;
}

/**
 * Hard-delete a project. Allowed only when status is `inactive` or `rejected`.
 * Cascades members + SEO activities and removes the stored logo.
 */
export async function deleteProject(_auth: AuthContext, projectId: string): Promise<void> {
  const project = await findProjectOrThrow(projectId);

  if (project.status !== "inactive" && project.status !== "rejected") {
    throw new ValidationError(
      { status: ["Only inactive or rejected projects can be deleted."] },
      "Project cannot be deleted in its current state.",
    );
  }

  const logoPath = project.logoImage;
  const id = project._id;

  await ProjectMember.deleteMany({ projectId: id });
  await SeoActivity.deleteMany({ projectId: id });
  await Project.deleteOne({ _id: id });
  await deleteStoredProjectLogo(logoPath).catch(() => undefined);
}

export function buildDeleteProjectResponse(): NextResponse {
  return ApiResponse.success(null, "Project deleted.");
}
