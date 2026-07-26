import { withApiHandler } from "@/lib/api/handler";
import { ApiResponse } from "@/lib/api/response";
import { runApiGuards } from "@/lib/auth/run-api-guards";
import { connectDb } from "@/lib/db/mongoose";
import { buildDeleteProjectResponse, deleteProject } from "@/lib/projects/delete-project";
import { buildGetProjectResponse, getProjectDetailForUser } from "@/lib/projects/get-project";
import { requireProjectPermission } from "@/lib/projects/get-project-access";
import {
  parseUpdateProjectRequest,
  resolveProjectLogoUpdate,
} from "@/lib/projects/parse-update-project-request";
import { buildUpdateProjectResponse, updateProject } from "@/lib/projects/update-project";
import { projectPermission } from "@/lib/rbac/permission-catalog";

export const GET = withApiHandler(async (request, context) => {
  await connectDb();

  const auth = await runApiGuards(request);
  if (auth instanceof Response) return auth;

  const { id } = await context!.params;
  if (!id) {
    return ApiResponse.error("Project Not Found.", {}, 404);
  }

  const viewError = await requireProjectPermission(auth, id, "projects.view");
  if (viewError) return viewError;

  const project = await getProjectDetailForUser(auth, id);

  if (!project) {
    return ApiResponse.error("Project Not Found.", {}, 404);
  }

  return buildGetProjectResponse(project);
});

export const PATCH = withApiHandler(async (request, context) => {
  await connectDb();

  const auth = await runApiGuards(request);
  if (auth instanceof Response) return auth;

  const { id } = await context!.params;
  if (!id) {
    return ApiResponse.error("Project Not Found.", {}, 404);
  }

  const updateError = await requireProjectPermission(auth, id, "projects.update");
  if (updateError) return updateError;

  const { input, presentFields, logoFile } = await parseUpdateProjectRequest(request);
  const logoImage = await resolveProjectLogoUpdate(auth, logoFile);
  const { project } = await updateProject(auth, id, input, presentFields, {
    logoImage: logoImage ?? undefined,
  });

  return buildUpdateProjectResponse(project);
});

/** Platform permission `projects.delete` (super_admin). Only inactive/rejected projects. */
export const DELETE = withApiHandler(async (request, context) => {
  await connectDb();

  const auth = await runApiGuards(request, { permission: projectPermission("projects", "delete") });
  if (auth instanceof Response) return auth;

  const { id } = await context!.params;
  if (!id) {
    return ApiResponse.error("Project Not Found.", {}, 404);
  }

  await deleteProject(auth, id);
  return buildDeleteProjectResponse();
});
