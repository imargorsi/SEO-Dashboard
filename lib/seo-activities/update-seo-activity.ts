import mongoose, { type Types } from "mongoose";
import { NextResponse } from "next/server";

import { NotFoundError } from "@/lib/api/http-errors";
import { ApiResponse } from "@/lib/api/response";
import type { AuthContext } from "@/lib/auth/guards";
import { serializeSeoActivity } from "@/lib/seo-activities/serialize-seo-activity";
import { SeoActivity, type SeoActivityDocument } from "@/models";
import type { UpdateSeoActivityInput } from "@/schemas/seo-activity";
import type { TSeoActivityType } from "@/types/seo-activity.types";

function typeSpecificFields(type: TSeoActivityType, input: UpdateSeoActivityInput) {
  if (type === "blogs") {
    return {
      title: input.title!.trim(),
      anchorText: null,
      details: null,
    };
  }

  if (type === "backlinks") {
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

export async function updateSeoActivity(
  auth: AuthContext,
  projectId: string,
  activityId: string,
  input: UpdateSeoActivityInput,
): Promise<{ activity: SeoActivityDocument }> {
  if (!mongoose.isValidObjectId(activityId)) {
    throw new NotFoundError("SEO Activity");
  }

  const activity = await SeoActivity.findOne({ _id: activityId, projectId });
  if (!activity) {
    throw new NotFoundError("SEO Activity");
  }

  activity.url = input.url;
  activity.occurredOn = input.occurredOn;
  const fields = typeSpecificFields(activity.activityType, input);
  activity.title = fields.title;
  activity.anchorText = fields.anchorText;
  activity.details = fields.details;
  activity.updatedBy = auth.user._id as Types.ObjectId;
  await activity.save();

  return { activity };
}

export function buildUpdateSeoActivityResponse(activity: SeoActivityDocument): NextResponse {
  return ApiResponse.success(serializeSeoActivity(activity), "Activity updated.");
}
