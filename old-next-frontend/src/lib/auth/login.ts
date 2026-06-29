import { api } from "@/lib/api"
import type { AuthUser, LoginApiResponse, LoginResponseData } from "@/lib/auth/authApi.types"
import { extractAuthUser, extractBearerToken } from "@/lib/auth/authApi.types"

/** POST `{ email, password }` — adjust if your backend uses e.g. `/v1/auth/login`. */
export const AUTH_LOGIN_ENDPOINT = "/v1/auth/login"

/** Resolve `token` / `user` whether nested under `data`, `data.data`, or top-level. */
export function getLoginPayload(json: LoginApiResponse): LoginResponseData | null {
  if (json.data != null && typeof json.data === "object") {
    const outer = json.data as Record<string, unknown>
    const inner = outer.data
    if (inner != null && typeof inner === "object") {
      const ir = inner as Record<string, unknown>
      if (
        typeof ir.token === "string" ||
        typeof ir.access_token === "string" ||
        ir.user != null
      ) {
        return inner as LoginResponseData
      }
    }
    return json.data as LoginResponseData
  }

  const root = json as unknown as Record<string, unknown>
  if (
    typeof root.token === "string" ||
    typeof root.access_token === "string" ||
    root.user != null
  ) {
    return root as LoginResponseData
  }

  return null
}

export type LoginResult = {
  token: string
  message: string | null
  user: AuthUser
}

export async function loginWithCredentials(
  email: string,
  password: string,
): Promise<LoginResult> {
  const json = await api.post<LoginApiResponse>(AUTH_LOGIN_ENDPOINT, {
    email,
    password,
  })

  const s = json.success
  if (s === false || s === 0) {
    throw new Error(json.message?.trim() || "Login failed")
  }

  const payload = getLoginPayload(json)
  if (payload == null) {
    throw new Error(json.message?.trim() || "Login failed")
  }

  const token = extractBearerToken(payload)
  if (!token) {
    throw new Error(
      json.message?.trim() || "No authentication token in response",
    )
  }

  const user = extractAuthUser(payload)
  if (!user) {
    throw new Error(json.message?.trim() || "Invalid user payload in response")
  }

  return { token, message: json.message, user }
}
