import mongoose from "mongoose";
import { NextResponse } from "next/server";

import { ApiResponse } from "@/lib/api/response";
import { NotFoundError, ValidationError } from "@/lib/api/http-errors";
import type { AuthContext } from "@/lib/auth/guards";
import type { ProjectStatus } from "@/lib/projects/constants";
import { serializeProject } from "@/lib/serializers/project";
import { Project, type ProjectDocument } from "@/models";

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

function assertProjectStatus(
  project: ProjectDocument,
  expectedStatus: ProjectStatus,
  actionLabel: string,
): void {
  if (project.status !== expectedStatus) {
    throw new ValidationError(
      { status: [`Project Must Be ${titleCaseStatus(expectedStatus)} To ${actionLabel}.`] },
      `Project Cannot Be ${actionLabel} In Its Current State.`,
    );
  }
}

function titleCaseStatus(status: ProjectStatus): string {
  if (status === "pending") return "Pending Approval";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export async function approveProject(auth: AuthContext, projectId: string): Promise<ProjectDocument> {
  const project = await findProjectOrThrow(projectId);
  assertProjectStatus(project, "pending", "Approved");

  project.status = "active";
  project.approvedAt = new Date();
  project.approvedByUserId = auth.user._id;
  project.rejectedAt = null;
  project.rejectedByUserId = null;
  await project.save();

  return project;
}

export async function rejectProject(auth: AuthContext, projectId: string): Promise<ProjectDocument> {
  const project = await findProjectOrThrow(projectId);
  assertProjectStatus(project, "pending", "Rejected");

  project.status = "rejected";
  project.rejectedAt = new Date();
  project.rejectedByUserId = auth.user._id;
  await project.save();

  return project;
}

export async function deactivateProject(_auth: AuthContext, projectId: string): Promise<ProjectDocument> {
  const project = await findProjectOrThrow(projectId);
  assertProjectStatus(project, "active", "Deactivated");

  project.status = "inactive";
  await project.save();

  return project;
}

export async function activateProject(_auth: AuthContext, projectId: string): Promise<ProjectDocument> {
  const project = await findProjectOrThrow(projectId);
  assertProjectStatus(project, "inactive", "Activated");

  project.status = "active";
  await project.save();

  return project;
}

export function buildProjectStatusResponse(
  project: ProjectDocument,
  message: string,
): NextResponse {
  return ApiResponse.success(serializeProject(project), message);
}
