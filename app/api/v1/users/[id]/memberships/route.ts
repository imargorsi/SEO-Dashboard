import { withApiHandler } from "@/lib/api/handler";
import { ApiResponse } from "@/lib/api/response";
import { runApiGuards } from "@/lib/auth/run-api-guards";
import { connectDb } from "@/lib/db/mongoose";
import { adminPermission } from "@/lib/rbac/permission-catalog";
import { upsertAdminUserMembership } from "@/lib/users/admin-user-membership";
import { upsertAdminUserMembershipSchema } from "@/schemas/admin-user-membership";

export const PUT = withApiHandler(async (request, context) => {
  await connectDb();

  const auth = await runApiGuards(request, { permission: adminPermission("users", "update") });
  if (auth instanceof Response) return auth;

  const { id } = await context!.params;
  const input = upsertAdminUserMembershipSchema.parse(await request.json());
  const { assignments } = await upsertAdminUserMembership(id, input);

  return ApiResponse.success({ projects: assignments }, "Project Assignment Saved.");
});
