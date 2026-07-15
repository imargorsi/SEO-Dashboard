import { withApiHandler } from "@/lib/api/handler";
import { runApiGuards } from "@/lib/auth/run-api-guards";
import { adminPermission } from "@/lib/rbac/permission-catalog";
import { connectDb } from "@/lib/db/mongoose";
import { buildGetAdminRoleResponse, getAdminRoleById } from "@/lib/roles/get-role";
import { buildUpdateRoleResponse, updateRole } from "@/lib/roles/update-role";
import { updateRoleSchema } from "@/schemas/role";

export const GET = withApiHandler(async (request, context) => {
  await connectDb();

  const auth = await runApiGuards(request, { permission: adminPermission("roles", "view") });
  if (auth instanceof Response) return auth;

  const { id } = await context!.params;
  const role = await getAdminRoleById(id);
  return buildGetAdminRoleResponse(role);
});

export const PATCH = withApiHandler(async (request, context) => {
  await connectDb();

  const auth = await runApiGuards(request, { permission: adminPermission("roles", "update") });
  if (auth instanceof Response) return auth;

  const input = updateRoleSchema.parse(await request.json());
  const { id } = await context!.params;
  const { role } = await updateRole(id, input);
  return buildUpdateRoleResponse(role);
});
