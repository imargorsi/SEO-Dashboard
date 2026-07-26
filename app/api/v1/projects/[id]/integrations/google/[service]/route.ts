import { ZodError } from "zod";

import { withApiHandler } from "@/lib/api/handler";
import { ApiResponse } from "@/lib/api/response";
import { runApiGuards } from "@/lib/auth/run-api-guards";
import { connectDb } from "@/lib/db/mongoose";
import {
  connectGoogleIntegration,
  disconnectGoogleIntegration,
  getGoogleIntegration,
} from "@/lib/integrations/manage-integration";
import { requireProjectPermission } from "@/lib/projects/get-project-access";
import {
  connectGoogleIntegrationSchema,
  googleIntegrationServiceSchema,
} from "@/schemas/analytics";

function zodFieldErrors(error: ZodError): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path[0] ? String(issue.path[0]) : "body";
    fieldErrors[key] = [...(fieldErrors[key] ?? []), issue.message];
  }
  return fieldErrors;
}

function parseServiceParam(service: string | undefined) {
  return googleIntegrationServiceSchema.parse(service);
}

export const GET = withApiHandler(async (request, context) => {
  await connectDb();

  const auth = await runApiGuards(request, { superAdmin: true });
  if (auth instanceof Response) return auth;

  const { id: projectId, service: serviceParam } = await context!.params;
  if (!projectId) {
    return ApiResponse.error("Project Not Found.", {}, 404);
  }

  const permissionError = await requireProjectPermission(auth, projectId, "analytics.view");
  if (permissionError) return permissionError;

  let service;
  try {
    service = parseServiceParam(serviceParam);
  } catch (error) {
    if (error instanceof ZodError) {
      return ApiResponse.validation("Validation Failed.", zodFieldErrors(error));
    }
    throw error;
  }

  const integration = await getGoogleIntegration(projectId, service);
  return ApiResponse.success(integration);
});

export const PUT = withApiHandler(async (request, context) => {
  await connectDb();

  const auth = await runApiGuards(request, { superAdmin: true });
  if (auth instanceof Response) return auth;

  const { id: projectId, service: serviceParam } = await context!.params;
  if (!projectId) {
    return ApiResponse.error("Project Not Found.", {}, 404);
  }

  const permissionError = await requireProjectPermission(auth, projectId, "analytics.view");
  if (permissionError) return permissionError;

  let service;
  try {
    service = parseServiceParam(serviceParam);
  } catch (error) {
    if (error instanceof ZodError) {
      return ApiResponse.validation("Validation Failed.", zodFieldErrors(error));
    }
    throw error;
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
    input = connectGoogleIntegrationSchema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      return ApiResponse.validation("Validation Failed.", zodFieldErrors(error));
    }
    throw error;
  }

  const integration = await connectGoogleIntegration(auth, projectId, service, input);
  return ApiResponse.success(integration, "Integration Connected.");
});

export const DELETE = withApiHandler(async (request, context) => {
  await connectDb();

  const auth = await runApiGuards(request, { superAdmin: true });
  if (auth instanceof Response) return auth;

  const { id: projectId, service: serviceParam } = await context!.params;
  if (!projectId) {
    return ApiResponse.error("Project Not Found.", {}, 404);
  }

  const permissionError = await requireProjectPermission(auth, projectId, "analytics.view");
  if (permissionError) return permissionError;

  let service;
  try {
    service = parseServiceParam(serviceParam);
  } catch (error) {
    if (error instanceof ZodError) {
      return ApiResponse.validation("Validation Failed.", zodFieldErrors(error));
    }
    throw error;
  }

  const integration = await disconnectGoogleIntegration(projectId, service);
  return ApiResponse.success(integration, "Integration Disconnected.");
});
