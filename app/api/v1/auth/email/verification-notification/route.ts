import { ApiResponse } from "@/lib/api/response";
import { withApiHandler } from "@/lib/api/handler";
import { authMessages } from "@/lib/auth/messages";
import { requireAuth } from "@/lib/auth/guards";
import { sendEmailVerification } from "@/lib/auth/login";
import { clientIp, ensureRouteNotRateLimited, recordRouteAttempt } from "@/lib/auth/rate-limit";
import { connectDb } from "@/lib/db/mongoose";

export const POST = withApiHandler(async (request) => {
  await connectDb();
  const auth = await requireAuth(request);
  if (auth instanceof Response) return auth;

  const ip = clientIp(request);
  const throttled = ensureRouteNotRateLimited("email-verification", ip);
  if (throttled !== null) {
    return ApiResponse.error(`Too many attempts. Please try again in ${throttled} seconds.`, {}, 429);
  }
  recordRouteAttempt("email-verification", ip);

  if (auth.user.hasVerifiedEmail()) {
    return ApiResponse.success(null, authMessages.alreadyVerified);
  }

  await sendEmailVerification(auth.user);
  return ApiResponse.success(null, authMessages.verificationSent, 202);
});
