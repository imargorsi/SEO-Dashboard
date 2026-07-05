import { withApiHandler } from "@/lib/api/handler";
import { changePassword } from "@/lib/auth/change-password";
import { requireAuth } from "@/lib/auth/guards";
import { connectDb } from "@/lib/db/mongoose";
import { changePasswordSchema } from "@/schemas/auth";

export const PUT = withApiHandler(async (request) => {
  await connectDb();
  const auth = await requireAuth(request);
  if (auth instanceof Response) return auth;
  const body = changePasswordSchema.parse(await request.json());
  return changePassword(auth.user, {
    current_password: body.current_password,
    new_password: body.new_password,
  });
});
