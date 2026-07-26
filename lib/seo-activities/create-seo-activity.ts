import { NextResponse } from "next/server";
import type { Types } from "mongoose";

import { ApiResponse } from "@/lib/api/response";
import type { AuthContext } from "@/lib/auth/guards";
import { serializeSeoActivity } from "@/lib/seo-activities/serialize-seo-activity";
import { SeoActivity, type SeoActivityDocument } from "@/models";
import type { CreateSeoActivityInput } from "@/schemas/seo-activity";

function typeSpecificFields(input: CreateSeoActivityInput) {
  if (input.type === "blogs") {
    return {
      title: input.title!.trim(),
      anchorText: null,
      details: null,
    };
  }

  if (input.type === "backlinks") {
    return {
      title: null,
      anchorText: input.anchorText!.trim(),
      details: null,
    };
  }

  return {
    title: null,
    anchorText: null,
    details: input.details!.trim(),
  };
}

export async function createSeoActivity(
  auth: AuthContext,
  projectId: string,
  input: CreateSeoActivityInput,
): Promise<{ activity: SeoActivityDocument }> {
  const userId = auth.user._id as Types.ObjectId;
  const activity = await SeoActivity.create({
    projectId,
    activityType: input.type,
    url: input.url,
    occurredOn: input.occurredOn,
    ...typeSpecificFields(input),
    createdBy: userId,
    updatedBy: userId,
  });

  return { activity };
}

export function buildCreateSeoActivityResponse(activity: SeoActivityDocument): NextResponse {
  return ApiResponse.success(serializeSeoActivity(activity), "Activity Created Successfully.", 201);
}
