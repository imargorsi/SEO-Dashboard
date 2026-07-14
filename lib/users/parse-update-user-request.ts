import { ValidationError } from "@/lib/api/http-errors";
import { validateProfileImageFile } from "@/lib/auth/profile-image-storage";
import { updateUserSchema, type UpdateUserInput } from "@/schemas/create-user";

export type UpdateUserRequest = {
  input: UpdateUserInput;
  profileImageFile: File | null;
};

export async function parseUpdateUserRequest(request: Request): Promise<UpdateUserRequest> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const dataField = formData.get("data");
    const profileImageField = formData.get("profile_image");

    if (typeof dataField !== "string" || !dataField.trim()) {
      throw ValidationError.fromFieldErrors({
        data: ["User Data Is Required."],
      });
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(dataField);
    } catch {
      throw ValidationError.fromFieldErrors({
        data: ["User Data Must Be Valid JSON."],
      });
    }

    const input = updateUserSchema.parse(parsed);
    const profileImageFile =
      profileImageField instanceof File && profileImageField.size > 0 ? profileImageField : null;

    if (profileImageFile) {
      const validationMessage = validateProfileImageFile(profileImageFile);
      if (validationMessage) {
        throw ValidationError.fromFieldErrors({
          profile_image: [validationMessage],
        });
      }
    }

    return { input, profileImageFile };
  }

  const body = updateUserSchema.parse(await request.json());
  return { input: body, profileImageFile: null };
}
