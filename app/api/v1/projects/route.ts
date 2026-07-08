import { withApiHandler } from "@/lib/api/handler";
import { runApiGuards } from "@/lib/auth/run-api-guards";
import { buildCreateProjectResponse, createProject } from "@/lib/projects/create-project";
import { buildListProjectsResponse, listProjects } from "@/lib/projects/list-projects";
import { connectDb } from "@/lib/db/mongoose";
import { createProjectSchema } from "@/schemas/project";

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

  const body = createProjectSchema.parse(await request.json());
  const { project } = await createProject(auth, body);

  return buildCreateProjectResponse(project);
});
