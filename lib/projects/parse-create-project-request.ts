import { ValidationError } from "@/lib/api/http-errors";
import type { AuthContext } from "@/lib/auth/guards";
import { validateProjectLogoFile, storeProjectLogoFile } from "@/lib/projects/project-logo-storage";
import { createProjectSchema, type CreateProjectInput } from "@/schemas/project";

export type CreateProjectRequest = {
  input: CreateProjectInput;
  logoFile: File | null;
};

export async function parseCreateProjectRequest(request: Request): Promise<CreateProjectRequest> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const dataField = formData.get("data");
    const logoField = formData.get("company_logo");

    if (typeof dataField !== "string" || !dataField.trim()) {
      throw ValidationError.fromFieldErrors({
        data: ["Project data is required."],
      });
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(dataField);
    } catch {
      throw ValidationError.fromFieldErrors({
        data: ["Project data must be valid JSON."],
      });
    }

    const input = createProjectSchema.parse(parsed);
    const logoFile = logoField instanceof File && logoField.size > 0 ? logoField : null;

    return { input, logoFile };
  }

  const body = createProjectSchema.parse(await request.json());
  return { input: body, logoFile: null };
}

export async function resolveProjectLogo(
  auth: AuthContext,
  logoFile: File | null,
): Promise<string | null> {
  if (!logoFile) return null;

  const validationMessage = validateProjectLogoFile(logoFile);
  if (validationMessage) {
    throw ValidationError.fromFieldErrors({
      company_logo: [validationMessage],
    });
  }

  try {
    return await storeProjectLogoFile(auth.user._id.toString(), logoFile);
  } catch (error) {
    console.error("Project Logo Upload Failed", error);
    throw ValidationError.fromFieldErrors({
      company_logo: ["Project logo upload is currently unavailable on this deployment."],
    });
  }
}
