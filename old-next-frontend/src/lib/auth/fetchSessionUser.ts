import { api } from "@/lib/api"
import { normalizeAuthUser, type AuthUser } from "@/lib/auth/authApi.types"
import { getToken } from "@/lib/auth/token"
import { getStoredAuthUser, setStoredAuthUser } from "@/lib/auth/sessionUser.ts"

/** Try common Laravel-style current-user responses. */
export function pickUserFromApiEnvelope(raw: unknown): AuthUser | null {
  if (raw == null || typeof raw !== "object") return null
  const o = raw as Record<string, unknown>

  if (typeof o.success === "boolean" && o.data != null && typeof o.data === "object") {
    const d = o.data as Record<string, unknown>
    if (d.user != null) {
      const u = normalizeAuthUser(d.user)
      if (u) return u
    }
    const fromData = normalizeAuthUser(o.data)
    if (fromData) return fromData
  }

  if (o.data != null && typeof o.data === "object") {
    const dr = o.data as Record<string, unknown>
    if (dr.user != null) {
      const u = normalizeAuthUser(dr.user)
      if (u) return u
    }
    const fromData = normalizeAuthUser(o.data)
    if (fromData) return fromData
  }

  if (o.user != null) {
    const u = normalizeAuthUser(o.user)
    if (u) return u
  }

  return normalizeAuthUser(raw)
}

const ME_ENDPOINT_CANDIDATES = [
  "/v1/me/profile",
  "/v1/auth/user",
  "/v1/auth/me",
  "/user",
] as const

/**
 * When a token exists but `auth_user` is missing (e.g. old session), GET a profile
 * endpoint and cache the user. Safe no-op if already cached or not authenticated.
 */
export async function tryFetchAndStoreAuthUser(): Promise<void> {
  if (typeof window === "undefined") return
  if (!getToken()) return
  if (getStoredAuthUser()) return

  for (const path of ME_ENDPOINT_CANDIDATES) {
    try {
      const raw = await api.get<unknown>(path)
      const user = pickUserFromApiEnvelope(raw)
      if (user) {
        setStoredAuthUser(user)
        return
      }
    } catch {
      /* try next path */
    }
  }
}
