import { withApiHandler } from "@/lib/api/handler";
import { runApiGuards } from "@/lib/auth/run-api-guards";
import { connectDb } from "@/lib/db/mongoose";
import { adminPermission } from "@/lib/rbac/permission-catalog";
import { buildDeleteAdminUserResponse, deleteAdminUser } from "@/lib/users/delete-user";
import { buildGetAdminUserResponse, getAdminUserById } from "@/lib/users/get-user";
import { parseUpdateUserRequest } from "@/lib/users/parse-update-user-request";
import { buildUpdateAdminUserResponse, updateAdminUser } from "@/lib/users/update-user";

export const GET = withApiHandler(async (request, context) => {
  await connectDb();

  const auth = await runApiGuards(request, { permission: adminPermission("users", "view") });
  if (auth instanceof Response) return auth;

  const { id } = await context!.params;
  const user = await getAdminUserById(id);
  return await buildGetAdminUserResponse(user);
});

export const PATCH = withApiHandler(async (request, context) => {
  await connectDb();

  const auth = await runApiGuards(request, { permission: adminPermission("users", "update") });
  if (auth instanceof Response) return auth;

  const { id } = await context!.params;
  const { input, profileImageFile } = await parseUpdateUserRequest(request);
  const { user } = await updateAdminUser(id, input, { profileImageFile });
  return buildUpdateAdminUserResponse(user);
});

export const DELETE = withApiHandler(async (request, context) => {
  await connectDb();

  const auth = await runApiGuards(request, { permission: adminPermission("users", "delete") });
  if (auth instanceof Response) return auth;

  const { id } = await context!.params;
  if (!id) {
    throw new Error("User Id Is Required.");
  }

  await deleteAdminUser(auth, id);
  return buildDeleteAdminUserResponse();
});
