import { normalizeAuthUser, type AuthUser } from "@/lib/frontend/auth/types";
import { resolveDefaultAccessiblePath } from "@/lib/frontend/layout/route-access";

export const AUTH_TOKEN_STORAGE_KEY = "auth_access_token";
export const AUTH_USER_STORAGE_KEY = "auth_user";
/** Keep in sync with `context/selected-project-context.tsx`. */
export const SELECTED_PROJECT_STORAGE_KEY = "dashboard-selected-project-id";
/** Mid-session 401 — clear RQ cache + force auth UI to drop the session. */
export const AUTH_SESSION_EXPIRED_EVENT = "auth:session-expired";
/** Any same-tab login/logout/clear so hooks subscribed to the token re-render. */
export const AUTH_SESSION_CHANGED_EVENT = "auth:session-changed";

const TOKEN_KEY = AUTH_TOKEN_STORAGE_KEY;
const USER_KEY = AUTH_USER_STORAGE_KEY;

function emitAuthSessionChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(AUTH_SESSION_CHANGED_EVENT));
}

export function notifyAuthSessionExpired(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(AUTH_SESSION_EXPIRED_EVENT));
  emitAuthSessionChanged();
}

/** Subscribe to same-tab + cross-tab auth storage changes (for `useSyncExternalStore`). */
export function subscribeAuthSession(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  const onStorage = (event: StorageEvent) => {
    if (
      event.key === AUTH_TOKEN_STORAGE_KEY ||
      event.key === AUTH_USER_STORAGE_KEY ||
      event.key === null
    ) {
      onStoreChange();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(AUTH_SESSION_CHANGED_EVENT, onStoreChange);
  window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(AUTH_SESSION_CHANGED_EVENT, onStoreChange);
    window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, onStoreChange);
  };
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
  emitAuthSessionChanged();
}

export function persistAuthSession(token: string, user: AuthUser): void {
  setAccessToken(token);
  setStoredAuthUser(user);
  emitAuthSessionChanged();
}

/** Default post-login route based on platform and project permissions. */
export function resolvePostLoginPath(user: AuthUser, projectPermissions: string[] = []): string {
  return resolveDefaultAccessiblePath(user.permissions, projectPermissions, user.roles);
}
