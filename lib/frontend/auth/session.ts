import { normalizeAuthUser, type AuthUser } from "@/lib/frontend/auth/types";
import { resolveDefaultAccessiblePath } from "@/lib/frontend/layout/route-access";

const TOKEN_KEY = "auth_access_token";
const USER_KEY = "auth_user";

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
