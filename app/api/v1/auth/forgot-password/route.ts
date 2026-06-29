import { ApiResponse } from "@/lib/api/response";
import { withApiHandler } from "@/lib/api/handler";
import { authMessages } from "@/lib/auth/messages";
import { sendPasswordResetLink } from "@/lib/auth/password-reset";
import { clientIp, ensureRouteNotRateLimited, recordRouteAttempt } from "@/lib/auth/rate-limit";
import { connectDb } from "@/lib/db/mongoose";
import { User } from "@/models";
import { forgotPasswordSchema } from "@/schemas/auth";

export const POST = withApiHandler(async (request) => {
  await connectDb();

  const ip = clientIp(request);
  const throttled = ensureRouteNotRateLimited("forgot-password", ip);
  if (throttled !== null) {
    return ApiResponse.error(`Too many attempts. Please try again in ${throttled} seconds.`, {}, 429);
  }
  recordRouteAttempt("forgot-password", ip);

  const body = forgotPasswordSchema.parse(await request.json());
  const user = await User.findOne({ email: body.email });

  if (!user) {
    return ApiResponse.error(
      authMessages.passwordResetUserNotFound,
      { email: [authMessages.passwordResetUserNotFound] },
      422
    );
  }

  return sendPasswordResetLink(body.email);
});
