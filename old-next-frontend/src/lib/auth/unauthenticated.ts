import { clearAuthSession } from "@/lib/auth/sessionUser"

function isUnauthenticatedBody(data: unknown): boolean {
  if (typeof data !== "object" || data === null) return false
  const body = data as Record<string, unknown>
  if (body.success !== false) return false
  const msg =
    typeof body.message === "string" ? body.message.trim().toLowerCase() : ""
  return (
    msg.includes("unauthenticated") ||
    msg.includes("unauthorized") ||
    msg === "token has expired" ||
    msg.includes("token expired")
  )
}

/** `401` or API JSON like `{ success: false, message: "Unauthenticated." }`. */
export function isUnauthenticatedResponse(
  status: number,
  data: unknown,
): boolean {
  if (status === 401) return true
  return isUnauthenticatedBody(data)
}

/** Clears session and sends the user to sign-in (`/`). */
export function redirectToSignIn(): void {
  if (typeof window === "undefined") return
  clearAuthSession()
  const path = window.location.pathname
  if (path === "/" || path === "") return
  window.location.replace("/")
}

export function handleUnauthenticatedResponse(
  status: number,
  data: unknown,
): boolean {
  if (!isUnauthenticatedResponse(status, data)) return false
  redirectToSignIn()
  return true
}
