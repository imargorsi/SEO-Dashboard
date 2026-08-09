import mongoose from "mongoose";
import { ZodError } from "zod";

import { withApiHandler } from "@/lib/api/handler";
import { ApiResponse } from "@/lib/api/response";
import { ValidationError } from "@/lib/api/http-errors";
import { runApiGuards } from "@/lib/auth/run-api-guards";
import { connectDb } from "@/lib/db/mongoose";
import { buildDeleteLeadResponse, deleteLead } from "@/lib/leads/delete-lead";
import { buildUpdateLeadResponse, updateLead } from "@/lib/leads/update-lead";
import { requireProjectPermission } from "@/lib/projects/get-project-access";
import { updateLeadSchema } from "@/schemas/lead";

function zodFieldErrors(error: ZodError): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path[0] ? String(issue.path[0]) : "body";
    fieldErrors[key] = [...(fieldErrors[key] ?? []), issue.message];
  }
  return fieldErrors;
}

export const PATCH = withApiHandler(async (request, context) => {
  await connectDb();

  const auth = await runApiGuards(request);
  if (auth instanceof Response) return auth;

  const params = await context!.params;
  const projectId = params.id;
  const leadId = params.leadId;

  if (!projectId || !leadId) {
    return ApiResponse.error("Lead Not Found.", {}, 404);
  }

  const permissionError = await requireProjectPermission(auth, projectId, "leads.update");
  if (permissionError) return permissionError;

  if (!mongoose.isValidObjectId(leadId)) {
    return ApiResponse.error("Lead Not Found.", {}, 404);
  }

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
    input = updateLeadSchema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      return ApiResponse.validation("Validation failed.", zodFieldErrors(error));
    }
    if (error instanceof ValidationError) {
      return ApiResponse.validation(error.message, error.errors);
    }
    throw error;
  }

  const { lead } = await updateLead(auth, projectId, leadId, input);
  return buildUpdateLeadResponse(lead);
});

export const DELETE = withApiHandler(async (request, context) => {
  await connectDb();

  const auth = await runApiGuards(request);
  if (auth instanceof Response) return auth;

  const params = await context!.params;
  const projectId = params.id;
  const leadId = params.leadId;

  if (!projectId || !leadId) {
    return ApiResponse.error("Lead Not Found.", {}, 404);
  }

  const permissionError = await requireProjectPermission(auth, projectId, "leads.delete");
  if (permissionError) return permissionError;

  await deleteLead(projectId, leadId);
  return buildDeleteLeadResponse();
});
