import { api } from "@/lib/api"
import type { LogoutApiResponse } from "@/lib/auth/authApi.types"

export const AUTH_LOGOUT_ENDPOINT = "/v1/auth/logout"

/** POST — invalidates session server-side; caller should clear local token after. */
export async function logoutWithApi(): Promise<string | null> {
  const json = await api.post<LogoutApiResponse>(AUTH_LOGOUT_ENDPOINT)
  const s = json.success
  if (s === false || s === 0) {
    throw new Error(json.message?.trim() || "Logout failed")
  }
  return json.message?.trim() ?? null
}
