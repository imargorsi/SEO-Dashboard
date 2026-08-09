import { ZodError } from "zod";

import { withApiHandler } from "@/lib/api/handler";
import { ApiResponse } from "@/lib/api/response";
import { ValidationError } from "@/lib/api/http-errors";
import { runApiGuards } from "@/lib/auth/run-api-guards";
import { connectDb } from "@/lib/db/mongoose";
import {
  buildCommitLeadsImportResponse,
  commitLeadsImport,
} from "@/lib/leads/commit-import";
import { requireProjectPermission } from "@/lib/projects/get-project-access";
import { parseLeadImportMapping } from "@/schemas/lead";

function zodFieldErrors(error: ZodError): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path[0] ? String(issue.path[0]) : "body";
    fieldErrors[key] = [...(fieldErrors[key] ?? []), issue.message];
  }
  return fieldErrors;
}

export const POST = withApiHandler(async (request, context) => {
  await connectDb();

  const auth = await runApiGuards(request);
  if (auth instanceof Response) return auth;

  const { id: projectId } = await context!.params;
  if (!projectId) {
    return ApiResponse.error("Project Not Found.", {}, 404);
  }

  const permissionError = await requireProjectPermission(auth, projectId, "leads.import");
  if (permissionError) return permissionError;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return ApiResponse.validation("Invalid Request Body.", {
      body: ["Request Must Be Multipart Form Data."],
    });
  }

  const fileEntry = formData.get("file");
  if (!(fileEntry instanceof File)) {
    return ApiResponse.validation("Validation failed.", {
      file: ["Csv File Is Required."],
    });
  }

  const mappingRaw = formData.get("mapping");
  if (typeof mappingRaw !== "string" || !mappingRaw.trim()) {
    return ApiResponse.validation("Validation failed.", {
      mapping: ["Column Mapping Is Required."],
    });
  }

  let mappingJson: unknown;
  try {
    mappingJson = JSON.parse(mappingRaw);
  } catch {
    return ApiResponse.validation("Validation failed.", {
      mapping: ["Column Mapping Must Be Valid Json."],
    });
  }

  let mapping;
  try {
    mapping = parseLeadImportMapping(mappingJson);
  } catch (error) {
    if (error instanceof ZodError) {
      return ApiResponse.validation("Validation failed.", zodFieldErrors(error));
    }
    throw error;
  }

  try {
    const result = await commitLeadsImport(auth, projectId, fileEntry, mapping);
    return buildCommitLeadsImportResponse(result);
  } catch (error) {
    if (error instanceof ValidationError) {
      return ApiResponse.validation(error.message, error.errors);
    }
    throw error;
  }
});
