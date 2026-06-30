import { ApiError } from "@/lib/frontend/api/errors";
import { isApiErrorEnvelope, type ApiErrorEnvelope, type ApiSuccessEnvelope } from "@/lib/frontend/api/types";
import { getAccessToken } from "@/lib/frontend/auth/session";

const API_PREFIX = "/api/v1";

export type BaseQueryOptions = Omit<RequestInit, "body" | "method"> & {
  headers?: Record<string, string>;
  /** Public routes (login, register) — skip Bearer header. */
  skipAuth?: boolean;
};

function resolveUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const trimmed = path.replace(/^\//, "");
  if (trimmed.startsWith("api/v1/")) {
    return `/${trimmed}`;
  }
  return `${API_PREFIX}/${trimmed}`;
}

function buildHeaders(body: RequestInit["body"], skipAuth: boolean): Record<string, string> {
  const headers: Record<string, string> = {};
  if (!(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
    headers.Accept = "application/json";
  }
  if (!skipAuth) {
    const token = getAccessToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }
  return headers;
}

function normalizeFieldErrors(errors: Record<string, string[] | string> | undefined): Record<string, string[]> {
  if (!errors) return {};
  return Object.fromEntries(
    Object.entries(errors).map(([key, value]) => [key, Array.isArray(value) ? value : [value]])
  );
}

async function parseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return response.json().catch(() => null);
  }
  return response.text();
}

async function request<T>(path: string, init: RequestInit & { skipAuth?: boolean } = {}): Promise<T> {
  const { skipAuth = false, headers: extraHeaders, ...rest } = init;
  const response = await fetch(resolveUrl(path), {
    ...rest,
    headers: {
      ...buildHeaders(rest.body, skipAuth),
      ...extraHeaders,
    },
  });

  const body = await parseBody(response);

  if (!response.ok) {
    if (isApiErrorEnvelope(body)) {
      throw new ApiError(body.message || "Request failed", response.status, normalizeFieldErrors(body.errors), body);
    }
    throw new ApiError(
      typeof body === "string" && body ? body : response.statusText || "Request failed",
      response.status,
      {},
      body
    );
  }

  return body as T;
}

async function unwrap<TData>(path: string, init: RequestInit & BaseQueryOptions = {}): Promise<ApiSuccessEnvelope<TData>> {
  const envelope = await request<ApiSuccessEnvelope<TData> | ApiErrorEnvelope>(path, init);

  if (isApiErrorEnvelope(envelope)) {
    throw new ApiError(envelope.message || "Request failed", 400, normalizeFieldErrors(envelope.errors), envelope);
  }

  return envelope;
}

/** RTK-style base query — all feature API modules use this. */
export const baseQuery = {
  get<TData>(path: string, options: BaseQueryOptions = {}) {
    return unwrap<TData>(path, { ...options, method: "GET" });
  },

  post<TData>(path: string, body?: unknown, options: BaseQueryOptions = {}) {
    return unwrap<TData>(path, {
      ...options,
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body ?? {}),
    });
  },

  put<TData>(path: string, body?: unknown, options: BaseQueryOptions = {}) {
    return unwrap<TData>(path, {
      ...options,
      method: "PUT",
      body: body instanceof FormData ? body : JSON.stringify(body ?? {}),
    });
  },

  patch<TData>(path: string, body?: unknown, options: BaseQueryOptions = {}) {
    return unwrap<TData>(path, {
      ...options,
      method: "PATCH",
      body: body instanceof FormData ? body : JSON.stringify(body ?? {}),
    });
  },

  delete<TData>(path: string, options: BaseQueryOptions = {}) {
    return unwrap<TData>(path, { ...options, method: "DELETE" });
  },
};
