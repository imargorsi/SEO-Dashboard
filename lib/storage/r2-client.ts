import { AwsClient } from "aws4fetch";

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required for R2 storage.`);
  }
  return value;
}

function r2Client(): AwsClient {
  return new AwsClient({
    accessKeyId: requiredEnv("R2_ACCESS_KEY_ID"),
    secretAccessKey: requiredEnv("R2_SECRET_ACCESS_KEY"),
    service: "s3",
    region: "auto",
  });
}

function objectUrl(pathname: string): string {
  const accountId = requiredEnv("R2_ACCOUNT_ID");
  const bucket = requiredEnv("R2_BUCKET_NAME");
  return `https://${accountId}.r2.cloudflarestorage.com/${bucket}/${pathname}`;
}

export function assertR2Configured(): void {
  requiredEnv("R2_ACCOUNT_ID");
  requiredEnv("R2_ACCESS_KEY_ID");
  requiredEnv("R2_SECRET_ACCESS_KEY");
  requiredEnv("R2_BUCKET_NAME");
}

export async function putR2Object(
  pathname: string,
  body: File,
  contentType: string,
): Promise<void> {
  const response = await r2Client().fetch(objectUrl(pathname), {
    method: "PUT",
    body,
    headers: { "Content-Type": contentType },
  });

  if (!response.ok) {
    throw new Error(`R2 upload failed (${response.status}): ${await response.text()}`);
  }
}

export async function getR2Object(
  pathname: string,
): Promise<{ stream: ReadableStream; contentType: string } | null> {
  const response = await r2Client().fetch(objectUrl(pathname), { method: "GET" });

  if (response.status === 404) return null;
  if (!response.ok || !response.body) {
    throw new Error(`R2 download failed (${response.status}): ${await response.text()}`);
  }

  return {
    stream: response.body,
    contentType: response.headers.get("content-type") ?? "application/octet-stream",
  };
}

export async function deleteR2Object(pathname: string): Promise<void> {
  const response = await r2Client().fetch(objectUrl(pathname), { method: "DELETE" });

  if (!response.ok && response.status !== 404) {
    throw new Error(`R2 delete failed (${response.status}): ${await response.text()}`);
  }
}
