import { ZodError } from "zod";

import { withApiHandler } from "@/lib/api/handler";
import { ApiResponse } from "@/lib/api/response";
import { runApiGuards } from "@/lib/auth/run-api-guards";
import { buildListRolesResponse, listRoles } from "@/lib/roles/list-roles";
import { adminPermission } from "@/lib/rbac/permission-catalog";
import { connectDb } from "@/lib/db/mongoose";
import { parseListRolesQuery } from "@/schemas/list-roles-query";

export const GET = withApiHandler(async (request) => {
  await connectDb();

  const auth = await runApiGuards(request, { permission: adminPermission("roles", "view") });
  if (auth instanceof Response) return auth;

  let query;
  try {
    query = parseListRolesQuery(new URL(request.url).searchParams);
  } catch (error) {
    if (error instanceof ZodError) {
      return ApiResponse.validation("Invalid Query Parameters.", {
        query: error.issues.map((issue) => issue.message),
      });
    }
    throw error;
  }

  const result = await listRoles(query);
  return buildListRolesResponse(result);
});
