import crypto from "crypto";
import { env } from "@/lib/config/env";

function appKeyBytes(): Buffer {
  const key = env.appKey();
  if (key.startsWith("base64:")) {
    return Buffer.from(key.slice("base64:".length), "base64");
  }
  return Buffer.from(key);
}

function buildCanonicalUrl(origin: string, pathname: string, searchParams: URLSearchParams): string {
  const params = new URLSearchParams();
  const sortedKeys = [...searchParams.keys()].filter((key) => key !== "signature").sort();
  for (const key of sortedKeys) {
    const value = searchParams.get(key);
    if (value !== null) params.append(key, value);
  }
  const queryString = params.toString();
  const base = `${origin.replace(/\/$/, "")}${pathname}`;
  return queryString ? `${base}?${queryString}` : base;
}

export function createSignedVerificationUrl(userId: string, email: string): string {
  const hash = crypto.createHash("sha1").update(email).digest("hex");
  const expires = Math.floor(Date.now() / 1000) + env.emailVerificationExpireMinutes() * 60;
  const origin = env.appUrl().replace(/\/$/, "");
  const pathname = `/email/verify/${userId}/${hash}`;
  const params = new URLSearchParams({ expires: String(expires) });
  const canonical = buildCanonicalUrl(origin, pathname, params);
  const signature = crypto.createHmac("sha256", appKeyBytes()).update(canonical).digest("hex");
  return `${canonical}&signature=${signature}`;
}

export function hasValidSignature(requestUrl: string): boolean {
  const url = new URL(requestUrl);
  const expires = url.searchParams.get("expires");
  const signature = url.searchParams.get("signature");
  if (!expires || !signature) return false;

  const expiresAt = Number(expires);
  if (!Number.isFinite(expiresAt) || expiresAt < Math.floor(Date.now() / 1000)) {
    return false;
  }

  const canonical = buildCanonicalUrl(url.origin, url.pathname, url.searchParams);
  const expected = crypto.createHmac("sha256", appKeyBytes()).update(canonical).digest("hex");

  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

export function emailVerificationHash(email: string): string {
  return crypto.createHash("sha1").update(email).digest("hex");
}

const IMAGE_URL_TTL_SECONDS = 10 * 60;

export function createSignedImageUrl(blobPathname: string): string {
  const origin = env.appUrl().replace(/\/$/, "");
  const pathname = "/api/v1/storage/image";
  const expires = Math.floor(Date.now() / 1000) + IMAGE_URL_TTL_SECONDS;
  const params = new URLSearchParams({
    pathname: blobPathname,
    expires: String(expires),
  });
  const canonical = buildCanonicalUrl(origin, pathname, params);
  const signature = crypto.createHmac("sha256", appKeyBytes()).update(canonical).digest("hex");
  return `${canonical}&signature=${signature}`;
}

export function hasValidImageSignature(requestUrl: string): boolean {
  return hasValidSignature(requestUrl);
}

export function hasValidProfileImageSignature(requestUrl: string): boolean {
  return hasValidImageSignature(requestUrl);
}
