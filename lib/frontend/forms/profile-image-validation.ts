export const PROFILE_IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "gif"]);

export function validateProfileImageFile(file: File): string | null {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  const mimeOk = !file.type || ALLOWED_MIME_TYPES.has(file.type);
  const extOk = ALLOWED_EXTENSIONS.has(extension);

  if (!mimeOk || !extOk) {
    return "Only JPG, PNG, WEBP, or GIF images are allowed.";
  }

  return null;
}
