import { withApiHandler } from "@/lib/api/handler";
import { ApiResponse } from "@/lib/api/response";
import { runApiGuards } from "@/lib/auth/run-api-guards";
import { buildGetProjectResponse, getProjectDetailForUser } from "@/lib/projects/get-project";
import {
  parseUpdateProjectRequest,
  resolveProjectLogoUpdate,
} from "@/lib/projects/parse-update-project-request";
import { buildUpdateProjectResponse, updateProject } from "@/lib/projects/update-project";
import { connectDb } from "@/lib/db/mongoose";

export const GET = withApiHandler(async (request, context) => {
  await connectDb();

  const auth = await runApiGuards(request, { permission: "projects.view" });
  if (auth instanceof Response) return auth;

  const { id } = await context!.params;
  if (!id) {
    return ApiResponse.error("Project Not Found.", {}, 404);
  }

  const project = await getProjectDetailForUser(auth, id);

  if (!project) {
    return ApiResponse.error("Project Not Found.", {}, 404);
  }

  return buildGetProjectResponse(project);
});

export const PATCH = withApiHandler(async (request, context) => {
  await connectDb();

  const auth = await runApiGuards(request, { permission: "projects.update" });
  if (auth instanceof Response) return auth;

  const { id } = await context!.params;
  if (!id) {
    return ApiResponse.error("Project Not Found.", {}, 404);
  }

  const { input, presentFields, logoFile } = await parseUpdateProjectRequest(request);
  const logoImage = await resolveProjectLogoUpdate(auth, logoFile);
  const { project } = await updateProject(auth, id, input, presentFields, {
    logoImage: logoImage ?? undefined,
  });

  return buildUpdateProjectResponse(project);
});
