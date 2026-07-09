import { createSignedImageUrl } from "@/lib/auth/signed-url";

/**
 * Converts a stored image reference (MongoDB) into a client-loadable URL.
 *
 * Stored formats:
 * - Vercel Blob: `blob:{pathname}` (private object)
 * - External URL: `http://` or `https://` (passthrough)
 */
export function serializeStoredImageUrl(storedImage: string | null | undefined): string | null {
  if (!storedImage) return null;
  if (storedImage.startsWith("blob:")) {
    return createSignedImageUrl(storedImage.slice("blob:".length));
  }
  if (storedImage.startsWith("http://") || storedImage.startsWith("https://")) {
    return storedImage;
  }
  return null;
}
