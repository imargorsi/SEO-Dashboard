import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { del, put } from "@vercel/blob";

const STORAGE_ROOT = path.join(process.cwd(), "public", "storage");
const BLOB_ENABLED = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

const MIME_TO_EXTENSION: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export const PROFILE_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

export const PROFILE_IMAGE_ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

function extensionForFile(file: File): string | null {
  const fromMime = MIME_TO_EXTENSION[file.type];
  if (fromMime) return fromMime;

  const fromName = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (["jpg", "jpeg", "png", "webp", "gif"].includes(fromName)) {
    return fromName === "jpeg" ? "jpg" : fromName;
  }

  return null;
}

export function validateProfileImageFile(file: File): string | null {
  if (file.size <= 0) {
    return "The profile image did not upload.";
  }

  if (file.size > PROFILE_IMAGE_MAX_BYTES) {
    return "The profile image must not be greater than 5 MB";
  }

  const extension = extensionForFile(file);
  const mimeOk = !file.type || PROFILE_IMAGE_ALLOWED_MIME_TYPES.has(file.type);

  if (!extension || !mimeOk) {
    return "The profile image must be a JPG, PNG, WEBP, or GIF image.";
  }

  return null;
}

export async function storeProfileImageFile(userId: string, file: File): Promise<string> {
  const extension = extensionForFile(file);
  if (!extension) {
    throw new Error("Unsupported profile image type.");
  }

  const filename = `${crypto.randomUUID()}.${extension}`;
  const relativePath = `profile-images/${userId}/${filename}`;

  if (BLOB_ENABLED) {
    const uploaded = await put(relativePath, file, {
      access: "private",
      addRandomSuffix: false,
    });
    return `blob:${uploaded.pathname}`;
  }

  const absoluteDir = path.join(STORAGE_ROOT, `profile-images/${userId}`);
  await fs.mkdir(absoluteDir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(absoluteDir, filename), buffer);
  return relativePath.replace(/\\/g, "/");
}

export async function deleteStoredProfileImage(storedPath: string | null | undefined): Promise<void> {
  if (!storedPath) return;

  if (storedPath.startsWith("blob:")) {
    if (!BLOB_ENABLED) return;
    await del(storedPath.slice("blob:".length)).catch(() => undefined);
    return;
  }

  if (storedPath.startsWith("http://") || storedPath.startsWith("https://")) {
    if (!BLOB_ENABLED) return;
    await del(storedPath).catch(() => undefined);
    return;
  }

  const absolutePath = path.join(STORAGE_ROOT, storedPath.replace(/^\//, ""));
  await fs.unlink(absolutePath).catch(() => undefined);
}
