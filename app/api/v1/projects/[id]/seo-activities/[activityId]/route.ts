import { withApiHandler } from "@/lib/api/handler";
import { ApiResponse } from "@/lib/api/response";
import { ValidationError } from "@/lib/api/http-errors";
import { runApiGuards } from "@/lib/auth/run-api-guards";
import { connectDb } from "@/lib/db/mongoose";
import { requireProjectPermission } from "@/lib/projects/get-project-access";
import {
  buildDeleteSeoActivityResponse,
  deleteSeoActivity,
} from "@/lib/seo-activities/delete-seo-activity";
import {
  buildUpdateSeoActivityResponse,
  updateSeoActivity,
} from "@/lib/seo-activities/update-seo-activity";
import { SeoActivity } from "@/models";
import { parseUpdateSeoActivityInput } from "@/schemas/seo-activity";
import mongoose from "mongoose";

export const PATCH = withApiHandler(async (request, context) => {
  await connectDb();

  const auth = await runApiGuards(request);
  if (auth instanceof Response) return auth;

  const params = await context!.params;
  const projectId = params.id;
  const activityId = params.activityId;

  if (!projectId || !activityId) {
    return ApiResponse.error("SEO Activity Not Found.", {}, 404);
  }

  const permissionError = await requireProjectPermission(auth, projectId, "seo_activities.update");
  if (permissionError) return permissionError;

  if (!mongoose.isValidObjectId(activityId)) {
    return ApiResponse.error("SEO Activity Not Found.", {}, 404);
  }

  const existing = await SeoActivity.findOne({ _id: activityId, projectId }).select("activityType");
  if (!existing) {
    return ApiResponse.error("SEO Activity Not Found.", {}, 404);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return ApiResponse.validation("Invalid Request Body.", {
      body: ["Request Body Must Be Valid JSON."],
    });
  }

  let input;
  try {
    input = parseUpdateSeoActivityInput(existing.activityType, body);
  } catch (error) {
    if (error instanceof ValidationError) {
      return ApiResponse.validation(error.message, error.errors);
    }
    throw error;
  }

  const { activity } = await updateSeoActivity(auth, projectId, activityId, input);
  return buildUpdateSeoActivityResponse(activity);
});

export const DELETE = withApiHandler(async (request, context) => {
  await connectDb();

  const auth = await runApiGuards(request);
  if (auth instanceof Response) return auth;

  const params = await context!.params;
  const projectId = params.id;
  const activityId = params.activityId;

  if (!projectId || !activityId) {
    return ApiResponse.error("SEO Activity Not Found.", {}, 404);
  }

  const permissionError = await requireProjectPermission(auth, projectId, "seo_activities.delete");
  if (permissionError) return permissionError;

  await deleteSeoActivity(projectId, activityId);
  return buildDeleteSeoActivityResponse();
});
