import { createSignedProfileImageUrl } from "@/lib/auth/signed-url";
import { env } from "@/lib/config/env";

/**
 * Converts a stored profile image reference (MongoDB `User.profileImage`) into a
 * client-loadable URL for `<img src>` / `UserAvatar`.
 *
 * **Stored value formats** (see `lib/auth/profile-image-storage.ts`):
 * - Local dev: `profile-images/{userId}/{file}` (written under `public/storage/`)
 * - Vercel Blob: `blob:{pathname}` (private object; pathname matches upload path)
 * - External URL: `http://` or `https://` (passthrough)
 *
 * Always use this helper when exposing profile images in API responses — never
 * return the raw DB path to the client.
 */
export function serializeProfileImageUrl(profileImage: string | null | undefined): string | null {
  if (!profileImage) return null;
  if (profileImage.startsWith("blob:")) {
    return createSignedProfileImageUrl(profileImage.slice("blob:".length));
  }
  if (profileImage.startsWith("http://") || profileImage.startsWith("https://")) {
    return profileImage;
  }

  const base = env.appUrl().replace(/\/$/, "");
  return `${base}/storage/${profileImage.replace(/^\//, "")}`;
}
