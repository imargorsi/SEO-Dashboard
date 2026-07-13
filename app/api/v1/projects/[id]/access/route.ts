import { withApiHandler } from "@/lib/api/handler";
import { ApiResponse } from "@/lib/api/response";
import { runApiGuards } from "@/lib/auth/run-api-guards";
import {
  buildProjectAccessResponse,
  getProjectAccessForUser,
} from "@/lib/projects/get-project-access";
import { connectDb } from "@/lib/db/mongoose";

export const GET = withApiHandler(async (request, context) => {
  await connectDb();

  const auth = await runApiGuards(request);
  if (auth instanceof Response) return auth;

  const { id } = await context!.params;
  if (!id) {
    return ApiResponse.error("Project Not Found.", {}, 404);
  }

  const access = await getProjectAccessForUser(auth, id);
  if (!access) {
    return ApiResponse.error("Project Not Found.", {}, 404);
  }

  return buildProjectAccessResponse(access);
});
