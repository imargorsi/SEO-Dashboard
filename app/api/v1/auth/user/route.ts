import { withApiHandler } from "@/lib/api/handler";
import { loadUserAuthData, requireAuth } from "@/lib/auth/guards";
import { serializeUser } from "@/lib/serializers/user";
import { ApiResponse } from "@/lib/api/response";
import { connectDb } from "@/lib/db/mongoose";

export const GET = withApiHandler(async (request) => {
  await connectDb();
  const auth = await requireAuth(request);
  if (auth instanceof Response) return auth;

  const authData = loadUserAuthData(auth.user);

  return ApiResponse.success(
    serializeUser(auth.user, {
      ...authData,
      includeHomeApiPath: true,
    })
  );
});
