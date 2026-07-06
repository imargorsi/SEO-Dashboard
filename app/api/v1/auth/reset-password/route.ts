import { withApiHandler } from "@/lib/api/handler";
import { resetPassword } from "@/lib/auth/password-reset";
import { clientIp, ensureRouteNotRateLimited, recordRouteAttempt } from "@/lib/auth/rate-limit";
import { ApiResponse } from "@/lib/api/response";
import { connectDb } from "@/lib/db/mongoose";
import { resetPasswordSchema } from "@/schemas/auth";

export const POST = withApiHandler(async (request) => {
  await connectDb();

  const ip = clientIp(request);
  const throttled = ensureRouteNotRateLimited("reset-password", ip);
  if (throttled !== null) {
    return ApiResponse.error(`Too many attempts. Please try again in ${throttled} seconds.`, {}, 429);
  }
  recordRouteAttempt("reset-password", ip);

  const body = resetPasswordSchema.parse(await request.json());
  return resetPassword({
    email: body.email,
    token: body.token,
    password: body.password,
  });
});
