import {
  deleteStoredImage,
  storeBlobImage,
  validateImageFile,
} from "@/lib/storage/blob-image-storage";

export { validateImageFile as validateProjectLogoFile } from "@/lib/storage/blob-image-storage";

export async function storeProjectLogoFile(creatorUserId: string, file: File): Promise<string> {
  return storeBlobImage(`project-logos/${creatorUserId}`, file);
}

export async function deleteStoredProjectLogo(storedPath: string | null | undefined): Promise<void> {
  return deleteStoredImage(storedPath);
}
