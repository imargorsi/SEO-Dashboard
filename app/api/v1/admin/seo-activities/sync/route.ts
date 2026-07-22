import { withApiHandler } from "@/lib/api/handler";
import { ApiResponse } from "@/lib/api/response";
import { runApiGuards } from "@/lib/auth/run-api-guards";
import { connectDb } from "@/lib/db/mongoose";
import { syncSeoActivities } from "@/lib/seo-activities/sync-seo-activities";

export const POST = withApiHandler(async (request) => {
  await connectDb();

  const auth = await runApiGuards(request, { superAdmin: true });
  if (auth instanceof Response) return auth;

  const result = await syncSeoActivities(auth.user._id.toString());

  return ApiResponse.success(result, "SEO Activities Synced Successfully.");
});
