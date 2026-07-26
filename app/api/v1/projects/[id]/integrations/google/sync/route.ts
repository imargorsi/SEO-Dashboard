import { withApiHandler } from "@/lib/api/handler";
import { ApiResponse } from "@/lib/api/response";
import { runApiGuards } from "@/lib/auth/run-api-guards";
import { env } from "@/lib/config/env";
import { connectDb } from "@/lib/db/mongoose";
import { GoogleNotConfiguredError } from "@/lib/integrations/google/auth";
import {
  assertManualSyncAllowed,
  syncProjectIntegrations,
} from "@/lib/integrations/sync-analytics";
import { requireProjectPermission } from "@/lib/projects/get-project-access";
import { ProjectIntegration } from "@/models";

export const POST = withApiHandler(async (request, context) => {
  await connectDb();

  const auth = await runApiGuards(request, { superAdmin: true });
  if (auth instanceof Response) return auth;

  const { id: projectId } = await context!.params;
  if (!projectId) {
    return ApiResponse.error("Project Not Found.", {}, 404);
  }

  const permissionError = await requireProjectPermission(auth, projectId, "analytics.view");
  if (permissionError) return permissionError;

  if (!env.googleConfigured()) {
    return ApiResponse.error("Google Service Account Is Not Configured.", {}, 503);
  }

  const integrations = await ProjectIntegration.find({
    projectId,
    provider: "google",
    status: { $in: ["connected", "error"] },
    externalPropertyId: { $ne: null },
  });

  if (integrations.length === 0) {
    return ApiResponse.error("No Connected Google Integrations Found.", {}, 400);
  }

  const cooldownMessage = assertManualSyncAllowed(integrations);
  if (cooldownMessage) {
    return ApiResponse.error(cooldownMessage, {}, 429);
  }

  try {
    const result = await syncProjectIntegrations(projectId);
    return ApiResponse.success(result, "Analytics Sync Completed.");
  } catch (error) {
    if (error instanceof GoogleNotConfiguredError) {
      return ApiResponse.error(error.message, {}, 503);
    }
    throw error;
  }
});
