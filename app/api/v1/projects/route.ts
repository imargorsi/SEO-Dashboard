import { withApiHandler } from "@/lib/api/handler";
import { runApiGuards } from "@/lib/auth/run-api-guards";
import { buildCreateProjectResponse, createProject } from "@/lib/projects/create-project";
import { buildListProjectsResponse, listProjects } from "@/lib/projects/list-projects";
import {
  parseCreateProjectRequest,
  resolveProjectLogo,
} from "@/lib/projects/parse-create-project-request";
import { connectDb } from "@/lib/db/mongoose";

export const GET = withApiHandler(async (request) => {
  await connectDb();

  const auth = await runApiGuards(request);
  if (auth instanceof Response) return auth;

  const projects = await listProjects(auth);
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
