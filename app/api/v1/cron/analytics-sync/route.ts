import { withApiHandler } from "@/lib/api/handler";
import { ApiResponse } from "@/lib/api/response";
import { env } from "@/lib/config/env";
import { connectDb } from "@/lib/db/mongoose";
import { GoogleNotConfiguredError } from "@/lib/integrations/google/auth";
import { syncAllConnectedProjects } from "@/lib/integrations/sync-analytics";

/** Allow long batch syncs on Vercel (Pro). Hobby plans still cap lower. */
export const maxDuration = 300;

function extractCronSecret(request: Request): string | null {
  const headerSecret = request.headers.get("x-cron-secret");
  if (headerSecret) return headerSecret.trim();

  const authHeader = request.headers.get("authorization");
  if (authHeader?.toLowerCase().startsWith("bearer ")) {
    return authHeader.slice(7).trim();
  }

  return null;
}

async function runAnalyticsCron(request: Request) {
  const configuredSecret = env.cronSecret();
  if (!configuredSecret) {
    return ApiResponse.error("Cron Secret Is Not Configured.", {}, 503);
  }

  const provided = extractCronSecret(request);
  if (!provided || provided !== configuredSecret) {
    return ApiResponse.error("Unauthorized.", {}, 401);
  }

  await connectDb();

  if (!env.googleConfigured()) {
    return ApiResponse.error("Google Service Account Is Not Configured.", {}, 503);
  }

  try {
    const result = await syncAllConnectedProjects();
    return ApiResponse.success(result, "Nightly Analytics Sync Completed.");
  } catch (error) {
    if (error instanceof GoogleNotConfiguredError) {
      return ApiResponse.error(error.message, {}, 503);
    }
    throw error;
  }
}

/** Vercel Cron invokes GET; POST is supported for manual/external schedulers. */
export const GET = withApiHandler(async (request) => runAnalyticsCron(request));
export const POST = withApiHandler(async (request) => runAnalyticsCron(request));
