import { ZodError } from "zod";

import { withApiHandler } from "@/lib/api/handler";
import { ApiResponse } from "@/lib/api/response";
import { runApiGuards } from "@/lib/auth/run-api-guards";
import { connectDb } from "@/lib/db/mongoose";
import { requireProjectPermission } from "@/lib/projects/get-project-access";
import {
  buildListSeoActivitiesResponse,
  listProjectSeoActivities,
} from "@/lib/seo-activities/list-seo-activities";
import { parseListSeoActivitiesQuery } from "@/schemas/list-seo-activities-query";

export const GET = withApiHandler(async (request, context) => {
  await connectDb();

  const auth = await runApiGuards(request);
  if (auth instanceof Response) return auth;

  const { id } = await context!.params;
  if (!id) {
    return ApiResponse.error("Project Not Found.", {}, 404);
  }

  const viewError = await requireProjectPermission(auth, id, "seo_activities.view");
  if (viewError) return viewError;

  let query;
  try {
    query = parseListSeoActivitiesQuery(new URL(request.url).searchParams);
  } catch (error) {
    if (error instanceof ZodError) {
      return ApiResponse.validation("Invalid Query Parameters.", {
        query: error.issues.map((issue) => issue.message),
      });
    }
    throw error;
  }

  const result = await listProjectSeoActivities(id, query);
  return buildListSeoActivitiesResponse(result);
});
