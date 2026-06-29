import { handleUnauthenticatedResponse } from "@/lib/auth/unauthenticated"
import { getToken } from "@/lib/auth/token"

const BASE_URL =  "https://rankradar.dominioninc.org/api"
// const BASE_URL =  "http://192.168.100.58:8004/api"


/** Origin for resolving relative media paths (e.g. /store/...) from the API */
export const API_ORIGIN = BASE_URL.replace(/\/api\/?$/, "").replace(/\/$/, "")

export type ApiThrownError = Error & {
  status: number
  data: unknown
}

export type ApiRequestOptions = Omit<RequestInit, "body" | "method"> & {
  /** Merged after default headers; values win over defaults */
  headers?: Record<string, string>
}

function getClientLocale(): "en" | "ar" {
  if (typeof window === "undefined") return "en"
  const pathMatch = window.location.pathname.match(/^\/(en|ar)(?:\/|$)/i)
  if (pathMatch) {
    return pathMatch[1].toLowerCase() === "ar" ? "ar" : "en"
  }
  try {
    const stored = localStorage.getItem("i18nextLng")
    const base = (stored ?? "en").split(/[-_]/)[0]?.toLowerCase() ?? "en"
    return base === "ar" ? "ar" : "en"
  } catch {
    return "en"
  }
}

function getDefaultHeaders(body: RequestInit["body"]): Record<string, string> {
  const headers: Record<string, string> = {
   
    "x-locale": getClientLocale().toUpperCase(),
  }
  if (!(body instanceof FormData)) {
    headers["Content-Type"] = "application/json"
  }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`
  return headers
}

function normalizeUrl(endpoint: string): string {
  if (endpoint.startsWith("http")) return endpoint
  const base = BASE_URL.replace(/\/$/, "")
  const path = endpoint.replace(/^\//, "")
  return `${base}/${path}`
}

function throwApiError(
  status: number,
  data: unknown,
  fallbackMessage: string,
): never {
  const message =
    (typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof (data as { message: unknown }).message === "string" &&
      (data as { message: string }).message) ||
    (typeof data === "object" &&
      data !== null &&
      "error" in data &&
      typeof (data as { error: unknown }).error === "string" &&
      (data as { error: string }).error) ||
    fallbackMessage
  const err = new Error(message) as ApiThrownError
  err.status = status
  err.data = data
  throw err
}

async function request<T = unknown>(
  endpoint: string,
  options: RequestInit & { headers?: Record<string, string> } = {},
): Promise<T> {
  const { headers: optionHeaders, body, ...rest } = options
  const url = normalizeUrl(endpoint)
  const config: RequestInit = {
    ...rest,
    headers: {
      ...getDefaultHeaders(body),
      ...optionHeaders,
    },
    body,
  }

  const response = await fetch(url, config)
  const contentType = response.headers.get("content-type")
  const isJson = contentType?.includes("application/json") ?? false
  const data = isJson
    ? await response.json().catch(() => null)
    : await response.text()

  if (handleUnauthenticatedResponse(response.status, data)) {
    throwApiError(
      401,
      data,
      typeof data === "object" &&
        data !== null &&
        "message" in data &&
        typeof (data as { message: unknown }).message === "string"
        ? (data as { message: string }).message
        : "Unauthenticated.",
    )
  }

  if (!response.ok) {
    throwApiError(
      response.status,
      data,
      typeof data === "object" && data !== null && "message" in data
        ? String((data as { message?: string }).message)
        : response.statusText || `Request failed: ${response.status}`,
    )
  }

  return data as T
}

/** Server / non-browser GET with explicit locale (no `window`). Optional for RSC or scripts. */
export async function apiGetServer<T = unknown>(
  endpoint: string,
  { locale = "en" }: { locale?: string } = {},
): Promise<T> {
  const url = normalizeUrl(endpoint)
  const loc = String(locale || "en").toLowerCase() === "ar" ? "ar" : "en"
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    
    "x-locale": loc.toUpperCase(),
  }

  const response = await fetch(url, { method: "GET", headers, cache: "no-store" })
  const contentType = response.headers.get("content-type")
  const isJson = contentType?.includes("application/json") ?? false
  const data = isJson
    ? await response.json().catch(() => null)
    : await response.text()

  if (!response.ok) {
    throwApiError(
      response.status,
      data,
      response.statusText || `Request failed: ${response.status}`,
    )
  }

  return data as T
}

function jsonBody(body: unknown): string | undefined {
  if (body == null) return undefined
  return JSON.stringify(body)
}

export const api = {
  get<T = unknown>(endpoint: string, options: ApiRequestOptions = {}) {
    return request<T>(endpoint, { ...options, method: "GET" })
  },

  post<T = unknown>(
    endpoint: string,
    body?: unknown,
    options: ApiRequestOptions = {},
  ) {
    const init: RequestInit & { headers?: Record<string, string> } = {
      ...options,
      method: "POST",
    }
    if (body instanceof FormData) {
      init.body = body
    } else {
      init.body = jsonBody(body)
    }
    return request<T>(endpoint, init)
  },

  put<T = unknown>(
    endpoint: string,
    body?: unknown,
    options: ApiRequestOptions = {},
  ) {
    const init: RequestInit & { headers?: Record<string, string> } = {
      ...options,
      method: "PUT",
    }
    if (body instanceof FormData) {
      init.body = body
    } else {
      init.body = jsonBody(body)
    }
    return request<T>(endpoint, init)
  },

  patch<T = unknown>(
    endpoint: string,
    body?: unknown,
    options: ApiRequestOptions = {},
  ) {
    const init: RequestInit & { headers?: Record<string, string> } = {
      ...options,
      method: "PATCH",
    }
    if (body instanceof FormData) {
      init.body = body
    } else {
      init.body = jsonBody(body)
    }
    return request<T>(endpoint, init)
  },

  delete<T = unknown>(endpoint: string, options: ApiRequestOptions = {}) {
    return request<T>(endpoint, { ...options, method: "DELETE" })
  },
}
