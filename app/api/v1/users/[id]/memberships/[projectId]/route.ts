import { withApiHandler } from "@/lib/api/handler";
import { ApiResponse } from "@/lib/api/response";
import { runApiGuards } from "@/lib/auth/run-api-guards";
import { connectDb } from "@/lib/db/mongoose";
import { adminPermission } from "@/lib/rbac/permission-catalog";
import { removeAdminUserMembership } from "@/lib/users/admin-user-membership";

export const DELETE = withApiHandler(async (request, context) => {
  await connectDb();

  const auth = await runApiGuards(request, { permission: adminPermission("users", "update") });
  if (auth instanceof Response) return auth;

  const { id, projectId } = await context!.params;
  const { assignments } = await removeAdminUserMembership(id, projectId);

  return ApiResponse.success({ projects: assignments }, "Project Assignment Removed.");
});
