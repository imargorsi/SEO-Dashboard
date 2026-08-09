import { withApiHandler } from "@/lib/api/handler";
import { ApiResponse } from "@/lib/api/response";
import { ValidationError } from "@/lib/api/http-errors";
import { runApiGuards } from "@/lib/auth/run-api-guards";
import { connectDb } from "@/lib/db/mongoose";
import {
  buildPreviewLeadsImportResponse,
  previewLeadsImport,
} from "@/lib/leads/preview-import";
import { requireProjectPermission } from "@/lib/projects/get-project-access";

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

  try {
    const payload = await previewLeadsImport(fileEntry);
    return buildPreviewLeadsImportResponse(payload);
  } catch (error) {
    if (error instanceof ValidationError) {
      return ApiResponse.validation(error.message, error.errors);
    }
    throw error;
  }
});
