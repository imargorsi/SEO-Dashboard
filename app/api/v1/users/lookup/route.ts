import { ZodError } from "zod";

import { withApiHandler } from "@/lib/api/handler";
import { ApiResponse } from "@/lib/api/response";
import { runApiGuards } from "@/lib/auth/run-api-guards";
import { buildLookupUsersResponse, lookupUsersForInvite } from "@/lib/users/lookup-users";
import { connectDb } from "@/lib/db/mongoose";
import { parseLookupUsersQuery } from "@/schemas/invite-project-member";

export const GET = withApiHandler(async (request) => {
  await connectDb();

  const auth = await runApiGuards(request);
  if (auth instanceof Response) return auth;

  let query;
  try {
    query = parseLookupUsersQuery(new URL(request.url).searchParams);
  } catch (error) {
    if (error instanceof ZodError) {
      return ApiResponse.validation("Invalid Query Parameters.", {
        query: error.issues.map((issue) => issue.message),
      });
    }
    throw error;
  }

  const items = await lookupUsersForInvite(query, { excludeUserId: auth.user._id.toString() });
  return buildLookupUsersResponse(items);
});
