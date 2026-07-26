import mongoose from "mongoose";
import { NextResponse } from "next/server";

import { NotFoundError } from "@/lib/api/http-errors";
import { ApiResponse } from "@/lib/api/response";
import { SeoActivity } from "@/models";

export async function deleteSeoActivity(projectId: string, activityId: string): Promise<void> {
  if (!mongoose.isValidObjectId(activityId)) {
    throw new NotFoundError("SEO Activity");
  }

  const result = await SeoActivity.deleteOne({ _id: activityId, projectId });
  if (result.deletedCount === 0) {
    throw new NotFoundError("SEO Activity");
  }
}

export function buildDeleteSeoActivityResponse(): NextResponse {
  return ApiResponse.success(null, "Activity Deleted Successfully.");
}
