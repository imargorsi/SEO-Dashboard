import mongoose from "mongoose";
import { NextResponse } from "next/server";

import { ApiResponse } from "@/lib/api/response";
import { ValidationError } from "@/lib/api/http-errors";
import type { AuthContext } from "@/lib/auth/guards";
import { Project, ProjectMember } from "@/models";

export async function acceptProjectInvitation(
  auth: AuthContext,
  projectId: string,
): Promise<void> {
  if (!mongoose.isValidObjectId(projectId)) {
    throw ValidationError.fromFieldErrors({
      projectId: ["Project Not Found."],
    });
  }

  const project = await Project.findById(projectId).select("_id status");
  if (!project || project.status === "rejected") {
    throw ValidationError.fromFieldErrors({
      projectId: ["Project Not Found."],
    });
  }

  const member = await ProjectMember.findOne({
    projectId,
    userId: auth.user._id,
    status: "invited",
  });

  if (!member) {
    throw ValidationError.fromFieldErrors({
      projectId: ["Pending Invitation Not Found."],
    });
  }

  member.status = "active";
  await member.save();
}

export async function declineProjectInvitation(
  auth: AuthContext,
  projectId: string,
): Promise<void> {
  if (!mongoose.isValidObjectId(projectId)) {
    throw ValidationError.fromFieldErrors({
      projectId: ["Project Not Found."],
    });
  }

  const member = await ProjectMember.findOne({
    projectId,
    userId: auth.user._id,
    status: "invited",
  });

  if (!member) {
    throw ValidationError.fromFieldErrors({
      projectId: ["Pending Invitation Not Found."],
    });
  }

  member.status = "removed";
  await member.save();
}

export function buildAcceptProjectInvitationResponse(): NextResponse {
  return ApiResponse.success(null, "Invitation Accepted.");
}

export function buildDeclineProjectInvitationResponse(): NextResponse {
  return ApiResponse.success(null, "Invitation Declined.");
}
