import { withApiHandler } from "@/lib/api/handler";
import { runApiGuards } from "@/lib/auth/run-api-guards";
import { connectDb } from "@/lib/db/mongoose";
import { adminPermission } from "@/lib/rbac/permission-catalog";
import {
  activateAdminUser,
  buildUserStatusResponse,
} from "@/lib/users/user-status-actions";

export const POST = withApiHandler(async (request, context) => {
  await connectDb();

  const auth = await runApiGuards(request, { permission: adminPermission("users", "update") });
  if (auth instanceof Response) return auth;

  const { id } = await context!.params;
  if (!id) {
    throw new Error("User Id Is Required.");
  }

  const user = await activateAdminUser(auth, id);
  return buildUserStatusResponse(user, "User Activated Successfully.");
});
