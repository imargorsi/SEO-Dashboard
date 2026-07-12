import { withApiHandler } from "@/lib/api/handler";
import { ApiResponse } from "@/lib/api/response";
import { runApiGuards } from "@/lib/auth/run-api-guards";
import { buildCreateProjectResponse, createProject } from "@/lib/projects/create-project";
import { buildListProjectsResponse, listProjects } from "@/lib/projects/list-projects";
import {
  parseCreateProjectRequest,
  resolveProjectLogo,
} from "@/lib/projects/parse-create-project-request";
import {
  normalizeListProjectsStatus,
  parseListProjectsQuery,
} from "@/schemas/list-projects-query";
import { connectDb } from "@/lib/db/mongoose";
import { ZodError } from "zod";

export const GET = withApiHandler(async (request) => {
  await connectDb();

  const auth = await runApiGuards(request);
  if (auth instanceof Response) return auth;

  let query;
  try {
    query = parseListProjectsQuery(new URL(request.url).searchParams);
  } catch (error) {
    if (error instanceof ZodError) {
      return ApiResponse.validation("Invalid Query Parameters.", {
        status: error.issues.map((issue) => issue.message),
      });
    }
    throw error;
  }

  const status = normalizeListProjectsStatus(query.status);
  const projects = await listProjects(auth, { status });
  return buildListProjectsResponse(projects);
});

export const POST = withApiHandler(async (request) => {
  await connectDb();

  const auth = await runApiGuards(request);
  if (auth instanceof Response) return auth;

  const { input, logoFile } = await parseCreateProjectRequest(request);
  const logoImage = await resolveProjectLogo(auth, logoFile);
  const { project } = await createProject(auth, input, { logoImage });

  return buildCreateProjectResponse(project);
});
