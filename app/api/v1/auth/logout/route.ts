import { ApiResponse } from "@/lib/api/response";
import { withApiHandler } from "@/lib/api/handler";
import { authMessages } from "@/lib/auth/messages";
import { requireAuth } from "@/lib/auth/guards";
import { revokeAccessToken, revokeAllUserTokens } from "@/lib/auth/tokens";
import { connectDb } from "@/lib/db/mongoose";

export const POST = withApiHandler(async (request) => {
  await connectDb();
  const auth = await requireAuth(request, { allowInactive: true });
  if (auth instanceof Response) return auth;

  const revoked = await revokeAccessToken(auth.token);
  if (!revoked) {
    await revokeAllUserTokens(auth.user._id);
  }

  return ApiResponse.success(null, authMessages.loggedOut);
});
