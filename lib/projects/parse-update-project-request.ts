import { ValidationError } from "@/lib/api/http-errors";
import type { AuthContext } from "@/lib/auth/guards";
import { validateProjectLogoFile, storeProjectLogoFile } from "@/lib/projects/project-logo-storage";
import {
  LOCKED_PROJECT_UPDATE_FIELDS,
  updateProjectSchema,
  type UpdateProjectInput,
} from "@/schemas/project";

export type UpdateProjectRequest = {
  input: UpdateProjectInput;
  presentFields: Set<string>;
  logoFile: File | null;
};

function assertNoLockedUpdateFields(raw: Record<string, unknown>): void {
  const errors: Record<string, string[]> = {};

  for (const field of LOCKED_PROJECT_UPDATE_FIELDS) {
    if (field in raw && raw[field] !== undefined) {
      const messages: Record<(typeof LOCKED_PROJECT_UPDATE_FIELDS)[number], string> = {
        businessName: "Business Name Cannot Be Changed.",
        pocEmail: "Contact Email Cannot Be Changed.",
        ownerUserId: "Project Owner Cannot Be Changed.",
      };
      errors[field] = [messages[field]];
    }
  }

  if (Object.keys(errors).length > 0) {
    throw ValidationError.fromFieldErrors(errors);
  }
}

function parseUpdateProjectBody(raw: unknown): { input: UpdateProjectInput; presentFields: Set<string> } {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    throw ValidationError.fromFieldErrors({
      _: ["Project Data Must Be A Valid Object."],
    });
  }

  const record = raw as Record<string, unknown>;
  assertNoLockedUpdateFields(record);

  const presentFields = new Set(Object.keys(record));
  const input = updateProjectSchema.parse(record);

  return { input, presentFields };
}

export async function parseUpdateProjectRequest(request: Request): Promise<UpdateProjectRequest> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const dataField = formData.get("data");
    const logoField = formData.get("company_logo");
    const logoFile = logoField instanceof File && logoField.size > 0 ? logoField : null;

    if (dataField == null || (typeof dataField === "string" && !dataField.trim())) {
      if (!logoFile) {
        throw ValidationError.fromFieldErrors({
          _: ["At Least One Field Must Be Provided."],
        });
      }

      return {
        input: {},
        presentFields: new Set<string>(),
        logoFile,
      };
    }

    if (typeof dataField !== "string") {
      throw ValidationError.fromFieldErrors({
        data: ["Project Data Must Be Valid JSON."],
      });
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(dataField);
    } catch {
      throw ValidationError.fromFieldErrors({
        data: ["Project Data Must Be Valid JSON."],
      });
    }

    const { input, presentFields } = parseUpdateProjectBody(parsed);

    if (presentFields.size === 0 && !logoFile) {
      throw ValidationError.fromFieldErrors({
        _: ["At Least One Field Must Be Provided."],
      });
    }

    return { input, presentFields, logoFile };
  }

  let parsed: unknown;
  try {
    parsed = await request.json();
  } catch {
    throw ValidationError.fromFieldErrors({
      _: ["Request Body Must Be Valid JSON."],
    });
  }

  const { input, presentFields } = parseUpdateProjectBody(parsed);

  if (presentFields.size === 0) {
    throw ValidationError.fromFieldErrors({
      _: ["At Least One Field Must Be Provided."],
    });
  }

  return { input, presentFields, logoFile: null };
}

export async function resolveProjectLogoUpdate(
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
      company_logo: ["Project Logo Upload Is Currently Unavailable On This Deployment."],
    });
  }
}
