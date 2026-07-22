import { withApiHandler } from "@/lib/api/handler";
import { ApiResponse } from "@/lib/api/response";
import { runApiGuards } from "@/lib/auth/run-api-guards";
import { connectDb } from "@/lib/db/mongoose";
import {
  getSeoActivitiesSheetSource,
  updateSeoActivitiesSheetSource,
} from "@/lib/seo-activities/sheet-source-config";
import { updateSeoActivitiesSheetSchema } from "@/schemas/update-seo-activities-sheet";

export const GET = withApiHandler(async (request) => {
  await connectDb();

  const auth = await runApiGuards(request, { superAdmin: true });
  if (auth instanceof Response) return auth;

  const source = await getSeoActivitiesSheetSource();
  return ApiResponse.success(source);
});

export const PATCH = withApiHandler(async (request) => {
  await connectDb();

  const auth = await runApiGuards(request, { superAdmin: true });
  if (auth instanceof Response) return auth;

  const input = updateSeoActivitiesSheetSchema.parse(await request.json());
  const source = await updateSeoActivitiesSheetSource(input.spreadsheetUrl);

  return ApiResponse.success(source, "Spreadsheet Url Updated Successfully.");
});
