import {
  deleteStoredImage,
  storeBlobImage,
  validateImageFile,
} from "@/lib/storage/blob-image-storage";

export {
  IMAGE_ALLOWED_MIME_TYPES as PROFILE_IMAGE_ALLOWED_MIME_TYPES,
  IMAGE_MAX_BYTES as PROFILE_IMAGE_MAX_BYTES,
  validateImageFile as validateProfileImageFile,
} from "@/lib/storage/blob-image-storage";

export async function storeProfileImageFile(userId: string, file: File): Promise<string> {
  return storeBlobImage(`profile-images/${userId}`, file);
}

export async function deleteStoredProfileImage(storedPath: string | null | undefined): Promise<void> {
  return deleteStoredImage(storedPath);
}
