import { normalizeAuthUser, type AuthUser } from "@/lib/frontend/auth/types";
import { resolveDefaultAccessiblePath } from "@/lib/frontend/layout/route-access";

export const AUTH_TOKEN_STORAGE_KEY = "auth_access_token";
export const AUTH_USER_STORAGE_KEY = "auth_user";
/** Keep in sync with `context/selected-project-context.tsx`. */
export const SELECTED_PROJECT_STORAGE_KEY = "dashboard-selected-project-id";
/** Dispatched from `baseQuery` on mid-session 401 so providers can clear RQ cache. */
export const AUTH_SESSION_EXPIRED_EVENT = "auth:session-expired";

const TOKEN_KEY = AUTH_TOKEN_STORAGE_KEY;
const USER_KEY = AUTH_USER_STORAGE_KEY;

export function notifyAuthSessionExpired(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(AUTH_SESSION_EXPIRED_EVENT));
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAccessToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* no-op */
  }
}

export function getStoredAuthUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    return normalizeAuthUser(JSON.parse(raw) as unknown);
  } catch {
    return null;
  }
}

export function setStoredAuthUser(user: AuthUser): void {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    /* no-op */
  }
}

export function clearAuthSession(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(SELECTED_PROJECT_STORAGE_KEY);
  } catch {
    /* no-op */
  }
}

export function persistAuthSession(token: string, user: AuthUser): void {
  setAccessToken(token);
  setStoredAuthUser(user);
}

/** Default post-login route based on platform and project permissions. */
export function resolvePostLoginPath(user: AuthUser, projectPermissions: string[] = []): string {
  return resolveDefaultAccessiblePath(user.permissions, projectPermissions, user.roles);
}
