import { serializeStoredImageUrl } from "@/lib/serializers/stored-image";

/** @deprecated Use serializeStoredImageUrl — kept for existing imports. */
export function serializeProfileImageUrl(profileImage: string | null | undefined): string | null {
  return serializeStoredImageUrl(profileImage);
}
