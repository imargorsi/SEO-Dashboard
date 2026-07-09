import crypto from "crypto";
import { del, put } from "@vercel/blob";

const MIME_TO_EXTENSION: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export const IMAGE_MAX_BYTES = 5 * 1024 * 1024;

export const IMAGE_ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

function assertBlobConfigured(): void {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("BLOB_READ_WRITE_TOKEN is required for image uploads.");
  }
}

function extensionForFile(file: File): string | null {
  const fromMime = MIME_TO_EXTENSION[file.type];
  if (fromMime) return fromMime;

  const fromName = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (["jpg", "jpeg", "png", "webp", "gif"].includes(fromName)) {
    return fromName === "jpeg" ? "jpg" : fromName;
  }

  return null;
}

export function validateImageFile(file: File): string | null {
  if (file.size <= 0) {
    return "The Image Did Not Upload.";
  }

  if (file.size > IMAGE_MAX_BYTES) {
    return "The Image Must Not Be Greater Than 5 MB.";
  }

  const extension = extensionForFile(file);
  const mimeOk = !file.type || IMAGE_ALLOWED_MIME_TYPES.has(file.type);

  if (!extension || !mimeOk) {
    return "The Image Must Be A JPG, PNG, WEBP, Or GIF Image.";
  }

  return null;
}

export async function storeBlobImage(relativePath: string, file: File): Promise<string> {
  assertBlobConfigured();

  const extension = extensionForFile(file);
  if (!extension) {
    throw new Error("Unsupported image type.");
  }

  const filename = `${crypto.randomUUID()}.${extension}`;
  const pathname = `${relativePath.replace(/\/$/, "")}/${filename}`;

  const uploaded = await put(pathname, file, {
    access: "private",
    addRandomSuffix: false,
  });

  return `blob:${uploaded.pathname}`;
}

export async function deleteStoredImage(storedPath: string | null | undefined): Promise<void> {
  if (!storedPath) return;

  if (!process.env.BLOB_READ_WRITE_TOKEN) return;

  if (storedPath.startsWith("blob:")) {
    await del(storedPath.slice("blob:".length)).catch(() => undefined);
    return;
  }

  if (storedPath.startsWith("http://") || storedPath.startsWith("https://")) {
    await del(storedPath).catch(() => undefined);
  }
}
