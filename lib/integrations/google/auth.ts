import { google } from "googleapis";

import { env } from "@/lib/config/env";

export class GoogleNotConfiguredError extends Error {
  constructor() {
    super("Google Service Account Is Not Configured.");
    this.name = "GoogleNotConfiguredError";
  }
}

function parseServiceAccountCredentials(): {
  client_email: string;
  private_key: string;
} {
  const json = env.googleServiceAccountJson();
  if (json) {
    try {
      const parsed = JSON.parse(json) as {
        client_email?: string;
        private_key?: string;
      };
      if (!parsed.client_email || !parsed.private_key) {
        throw new GoogleNotConfiguredError();
      }
      return {
        client_email: parsed.client_email,
        private_key: parsed.private_key.replace(/\\n/g, "\n"),
      };
    } catch (error) {
      if (error instanceof GoogleNotConfiguredError) throw error;
      throw new GoogleNotConfiguredError();
    }
  }

  const email = env.googleServiceAccountEmail();
  const privateKey = env.googleServiceAccountPrivateKey();
  if (!email || !privateKey) {
    throw new GoogleNotConfiguredError();
  }

  return { client_email: email, private_key: privateKey };
}

const GSC_SCOPES = ["https://www.googleapis.com/auth/webmasters.readonly"];
const GA4_SCOPES = ["https://www.googleapis.com/auth/analytics.readonly"];

/** googleapis + google-auth-library duplicate types; keep untyped at the boundary. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TGoogleAuthClient = any;

export function createGoogleAuth(scopes: string[]): TGoogleAuthClient {
  if (!env.googleConfigured()) {
    throw new GoogleNotConfiguredError();
  }

  const credentials = parseServiceAccountCredentials();
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: credentials.client_email,
      private_key: credentials.private_key,
    },
    scopes,
  });
}

export function createSearchConsoleAuth(): TGoogleAuthClient {
  return createGoogleAuth(GSC_SCOPES);
}

export function createAnalyticsAuth(): TGoogleAuthClient {
  return createGoogleAuth(GA4_SCOPES);
}

export async function withGoogleBackoff<T>(
  operation: () => Promise<T>,
  options?: { maxAttempts?: number; baseDelayMs?: number },
): Promise<T> {
  const maxAttempts = options?.maxAttempts ?? 4;
  const baseDelayMs = options?.baseDelayMs ?? 500;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const status = extractGoogleStatus(error);
      const retryable = status === 429 || status === 500 || status === 503;
      if (!retryable || attempt === maxAttempts) {
        throw error;
      }
      const delay = baseDelayMs * 2 ** (attempt - 1);
      await sleep(delay);
    }
  }

  throw lastError;
}

function extractGoogleStatus(error: unknown): number | null {
  if (!error || typeof error !== "object") return null;
  const withCode = error as { code?: number | string; response?: { status?: number } };
  if (typeof withCode.code === "number") return withCode.code;
  if (typeof withCode.code === "string" && /^\d+$/.test(withCode.code)) {
    return Number(withCode.code);
  }
  if (typeof withCode.response?.status === "number") return withCode.response.status;
  return null;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function formatGoogleError(error: unknown): string {
  if (error instanceof GoogleNotConfiguredError) return error.message;
  if (error && typeof error === "object" && "message" in error) {
    const message = String((error as { message: unknown }).message);
    if (message.includes("DECODER routines") || message.includes("ERR_OSSL_UNSUPPORTED")) {
      return "Google Service Account private key could not be decoded. Check GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY on the host (literal \\n newlines, no wrapping quotes).";
    }
    return message.slice(0, 500) || "Google Api Request Failed.";
  }
  return "Google Api Request Failed.";
}
