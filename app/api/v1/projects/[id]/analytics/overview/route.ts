import { ZodError } from "zod";

import { withApiHandler } from "@/lib/api/handler";
import { ApiResponse } from "@/lib/api/response";
import { runApiGuards } from "@/lib/auth/run-api-guards";
import { connectDb } from "@/lib/db/mongoose";
import { getAnalyticsOverview } from "@/lib/integrations/read-analytics";
import { getProjectAccessForUser } from "@/lib/projects/get-project-access";
import { hasPermission } from "@/lib/rbac/access";
import { parseAnalyticsOverviewQuery } from "@/schemas/analytics";

function zodFieldErrors(error: ZodError): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path[0] ? String(issue.path[0]) : "query";
    fieldErrors[key] = [...(fieldErrors[key] ?? []), issue.message];
  }
  return fieldErrors;
}

export const GET = withApiHandler(async (request, context) => {
  await connectDb();

  const auth = await runApiGuards(request);
  if (auth instanceof Response) return auth;

  const { id: projectId } = await context!.params;
  if (!projectId) {
    return ApiResponse.error("Project Not Found.", {}, 404);
  }

  const access = await getProjectAccessForUser(auth, projectId);
  if (!access || !hasPermission(access.permissions, "analytics.view")) {
    return ApiResponse.error("Forbidden.", {}, 403);
  }

  let query;
  try {
    query = parseAnalyticsOverviewQuery(new URL(request.url).searchParams);
  } catch (error) {
    if (error instanceof ZodError) {
      return ApiResponse.validation("Validation Failed.", zodFieldErrors(error));
    }
    throw error;
  }

  const overview = await getAnalyticsOverview(projectId, query);

  if (!hasPermission(access.permissions, "integrations.view")) {
    overview.integrations = { gsc: null, ga4: null };
  }

  return ApiResponse.success(overview);
});
