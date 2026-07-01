import { ApiResponse } from "@/lib/api/response";
import { withApiHandler } from "@/lib/api/handler";
import { buildRegisterResponse, registerUser } from "@/lib/auth/register";
import { clientIp, ensureRouteNotRateLimited, recordRouteAttempt } from "@/lib/auth/rate-limit";
import { connectDb } from "@/lib/db/mongoose";
import { registerSchema } from "@/schemas/auth";

export const POST = withApiHandler(async (request) => {
  await connectDb();

  const ip = clientIp(request);
  const throttled = ensureRouteNotRateLimited("register", ip);
  if (throttled !== null) {
    return ApiResponse.error(`Too many attempts. Please try again in ${throttled} seconds.`, {}, 429);
  }
  recordRouteAttempt("register", ip);

  const body = registerSchema.parse(await request.json());
  const result = await registerUser({
    name: body.name,
    email: body.email,
    password: body.password,
  });

  if (result instanceof Response) {
    return result;
  }

  return buildRegisterResponse(result.user);
});
