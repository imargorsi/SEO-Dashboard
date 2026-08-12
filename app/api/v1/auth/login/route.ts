import { authenticateLogin, buildLoginResponse } from "@/lib/auth/login";
import { withApiHandler } from "@/lib/api/handler";
import { connectDb } from "@/lib/db/mongoose";
import { loginSchema } from "@/schemas/auth";

export const POST = withApiHandler(async (request) => {
  await connectDb();
  const body = loginSchema.parse(await request.json());
  const result = await authenticateLogin(body.email, body.password, request);

  if (result instanceof Response) {
    return result;
  }

  return buildLoginResponse(result.user);
});
