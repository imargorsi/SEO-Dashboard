import { withApiHandler } from "@/lib/api/handler";
import { requireAuth } from "@/lib/auth/guards";
import { loadPlatformUserAuthData } from "@/lib/auth/effective-user-auth";
import { serializeUser } from "@/lib/serializers/user";
import { ApiResponse } from "@/lib/api/response";
import { connectDb } from "@/lib/db/mongoose";

export const GET = withApiHandler(async (request) => {
  await connectDb();
  const auth = await requireAuth(request);
  if (auth instanceof Response) return auth;

  const authData = await loadPlatformUserAuthData(auth.user);

  return ApiResponse.success(
    serializeUser(auth.user, {
      ...authData,
      includeHomeApiPath: true,
    })
  );
});
