import { withApiHandler } from "@/lib/api/handler";
import { ApiResponse } from "@/lib/api/response";
import { runApiGuards } from "@/lib/auth/run-api-guards";
import { buildListUsersResponse, listUsers } from "@/lib/users/list-users";
import { adminPermission } from "@/lib/rbac/permission-catalog";
import { connectDb } from "@/lib/db/mongoose";
import { parseListUsersQuery } from "@/schemas/list-users-query";
import { ZodError } from "zod";
import { createUser, buildCreateUserResponse } from "@/lib/users/create-user";
import { parseCreateUserRequest } from "@/lib/users/parse-create-user-request";

export const GET = withApiHandler(async (request) => {
  await connectDb();

  const auth = await runApiGuards(request, { permission: adminPermission("users", "view") });
  if (auth instanceof Response) return auth;

  let query;
  try {
    query = parseListUsersQuery(new URL(request.url).searchParams);
  } catch (error) {
    if (error instanceof ZodError) {
      return ApiResponse.validation("Invalid Query Parameters.", {
        query: error.issues.map((issue) => issue.message),
      });
    }
    throw error;
  }

  const result = await listUsers(query);
  return buildListUsersResponse(result);
});


export const POST = withApiHandler(async (request) => {
  await connectDb();

  const auth = await runApiGuards(request, {
    permission: adminPermission("users", "create"),
  });
  if (auth instanceof Response) return auth;

  const { input, profileImageFile } = await parseCreateUserRequest(request);
  const { user } = await createUser(input, { profileImageFile });

  return buildCreateUserResponse(user);
});