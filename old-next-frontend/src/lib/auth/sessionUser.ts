import { normalizeAuthUser, type AuthUser } from "@/lib/auth/authApi.types"
import { clearToken } from "@/lib/auth/token"

const USER_KEY = "auth_user"

export const AUTH_USER_UPDATED_EVENT = "auth-user-updated"

function notifyAuthUserChanged(): void {
  if (typeof window === "undefined") return
  window.dispatchEvent(new Event(AUTH_USER_UPDATED_EVENT))
}

/** Subscribe to localStorage `auth_user` changes (same tab + other tabs). */
export function subscribeAuthUser(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") return () => {}
  window.addEventListener("storage", onStoreChange)
  window.addEventListener(AUTH_USER_UPDATED_EVENT, onStoreChange)
  return () => {
    window.removeEventListener("storage", onStoreChange)
    window.removeEventListener(AUTH_USER_UPDATED_EVENT, onStoreChange)
  }
}

export function getStoredAuthUser(): AuthUser | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(USER_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    return normalizeAuthUser(parsed)
  } catch {
    return null
  }
}

/**
 * Raw JSON string from storage — use as `useSyncExternalStore` snapshot only.
 * (`getStoredAuthUser` returns a new object each call → infinite re-renders if used as snapshot.)
 */
export function getStoredAuthUserRawSnapshot(): string {
  if (typeof window === "undefined") return ""
  try {
    return localStorage.getItem(USER_KEY) ?? ""
  } catch {
    return ""
  }
}

export function setStoredAuthUser(user: AuthUser): void {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    notifyAuthUserChanged()
  } catch {
    /* no-op */
  }
}

export function clearStoredAuthUser(): void {
  try {
    localStorage.removeItem(USER_KEY)
    notifyAuthUserChanged()
  } catch {
    /* no-op */
  }
}

/** Clears bearer token and cached user (call on logout). */
export function clearAuthSession(): void {
  clearToken()
  clearStoredAuthUser()
}
