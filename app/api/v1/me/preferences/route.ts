import { withApiHandler } from "@/lib/api/handler";
import { ApiResponse } from "@/lib/api/response";
import { requireAuth } from "@/lib/auth/guards";
import { connectDb } from "@/lib/db/mongoose";
import { serializeUserPreferences, updateUserPreferences } from "@/lib/users/preferences";
import { updateUserPreferencesSchema } from "@/schemas/preferences";

export const GET = withApiHandler(async (request) => {
  await connectDb();
  const auth = await requireAuth(request);
  if (auth instanceof Response) return auth;

  return ApiResponse.success(serializeUserPreferences(auth.user));
});

export const PATCH = withApiHandler(async (request) => {
  await connectDb();
  const auth = await requireAuth(request);
  if (auth instanceof Response) return auth;

  const body = updateUserPreferencesSchema.parse(await request.json());
  const data = await updateUserPreferences(auth.user, body);

  return ApiResponse.success(data, "Preferences Saved.");
});
