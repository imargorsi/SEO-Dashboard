import { withApiHandler } from "@/lib/api/handler";
import { runApiGuards } from "@/lib/auth/run-api-guards";
import { connectDb } from "@/lib/db/mongoose";
import { adminPermission } from "@/lib/rbac/permission-catalog";
import { activateRole, buildRoleStatusResponse } from "@/lib/roles/role-status-actions";

export const POST = withApiHandler(async (request, context) => {
  await connectDb();

  const auth = await runApiGuards(request, { permission: adminPermission("roles", "update") });
  if (auth instanceof Response) return auth;

  const { id } = await context!.params;
  const role = await activateRole(auth, id);
  return buildRoleStatusResponse(role, "Role Activated Successfully.");
});
