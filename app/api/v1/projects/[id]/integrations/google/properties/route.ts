import { withApiHandler } from "@/lib/api/handler";
import { ApiResponse } from "@/lib/api/response";
import { runApiGuards } from "@/lib/auth/run-api-guards";
import { env } from "@/lib/config/env";
import { connectDb } from "@/lib/db/mongoose";
import {
  formatGoogleError,
  GoogleNotConfiguredError,
} from "@/lib/integrations/google/auth";
import { listGa4Properties } from "@/lib/integrations/google/analytics";
import { listGscSites } from "@/lib/integrations/google/search-console";
import { requireProjectPermission } from "@/lib/projects/get-project-access";
import type { TGooglePropertyOption } from "@/types/analytics.types";

export const GET = withApiHandler(async (request, context) => {
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

  try {
    const [gscSites, ga4Properties] = await Promise.all([
      listGscSites(),
      listGa4Properties(),
    ]);

    const properties: TGooglePropertyOption[] = [
      ...gscSites.map((site) => ({
        id: site.id,
        name: site.name,
        service: "gsc" as const,
      })),
      ...ga4Properties.map((property) => ({
        id: property.id,
        name: property.name,
        service: "ga4" as const,
      })),
    ];

    return ApiResponse.success({ properties });
  } catch (error) {
    if (error instanceof GoogleNotConfiguredError) {
      return ApiResponse.error(error.message, {}, 503);
    }
    return ApiResponse.error(formatGoogleError(error), {}, 502);
  }
});
