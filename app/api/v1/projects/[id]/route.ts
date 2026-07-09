import { withApiHandler } from "@/lib/api/handler";
import { ApiResponse } from "@/lib/api/response";
import { runApiGuards } from "@/lib/auth/run-api-guards";
import { buildGetProjectResponse, getProjectForUser } from "@/lib/projects/get-project";
import { connectDb } from "@/lib/db/mongoose";

export const GET = withApiHandler(async (request, context) => {
  await connectDb();

  const auth = await runApiGuards(request, { permission: "projects.view" });
  if (auth instanceof Response) return auth;

  const { id } = await context!.params;
  if (!id) {
    return ApiResponse.error("Project Not Found.", {}, 404);
  }

  const project = await getProjectForUser(auth, id);

  if (!project) {
    return ApiResponse.error("Project Not Found.", {}, 404);
  }

  return buildGetProjectResponse(project);
});
