import { ZodError } from "zod";

import { withApiHandler } from "@/lib/api/handler";
import { ApiResponse } from "@/lib/api/response";
import { runApiGuards } from "@/lib/auth/run-api-guards";
import { connectDb } from "@/lib/db/mongoose";
import { buildCreateLeadResponse, createLead } from "@/lib/leads/create-lead";
import { buildListLeadsResponse, listLeads } from "@/lib/leads/list-leads";
import { requireProjectPermission } from "@/lib/projects/get-project-access";
import { createLeadSchema } from "@/schemas/lead";
import { parseListLeadsQuery } from "@/schemas/list-leads-query";

function zodFieldErrors(error: ZodError): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path[0] ? String(issue.path[0]) : "body";
    fieldErrors[key] = [...(fieldErrors[key] ?? []), issue.message];
  }
  return fieldErrors;
}

export const GET = withApiHandler(async (request, context) => {
  await connectDb();

  const auth = await runApiGuards(request);
  if (auth instanceof Response) return auth;

  const { id: projectId } = await context!.params;
  if (!projectId) {
    return ApiResponse.error("Project Not Found.", {}, 404);
  }

  const permissionError = await requireProjectPermission(auth, projectId, "leads.view");
  if (permissionError) return permissionError;

  let query;
  try {
    query = parseListLeadsQuery(new URL(request.url).searchParams);
  } catch (error) {
    if (error instanceof ZodError) {
      return ApiResponse.validation("Validation failed.", zodFieldErrors(error));
    }
    throw error;
  }

  const payload = await listLeads(projectId, query);
  return buildListLeadsResponse(payload);
});

export const POST = withApiHandler(async (request, context) => {
  await connectDb();

  const auth = await runApiGuards(request);
  if (auth instanceof Response) return auth;

  const { id: projectId } = await context!.params;
  if (!projectId) {
    return ApiResponse.error("Project Not Found.", {}, 404);
  }

  const permissionError = await requireProjectPermission(auth, projectId, "leads.create");
  if (permissionError) return permissionError;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return ApiResponse.validation("Invalid Request Body.", {
      body: ["Request Body Must Be Valid JSON."],
    });
  }

  let input;
  try {
    input = createLeadSchema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      return ApiResponse.validation("Validation failed.", zodFieldErrors(error));
    }
    throw error;
  }

  const { lead } = await createLead(auth, projectId, input);
  return buildCreateLeadResponse(lead);
});
