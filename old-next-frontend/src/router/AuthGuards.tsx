import type { ReactNode } from "react"
import { Navigate } from "react-router-dom"
import { getToken } from "@/lib/auth/token"

/** Dashboard and other authenticated areas — no token → sign-in. */
export function RequireAuth({ children }: { children: ReactNode }) {
  if (!getToken()) return <Navigate to="/" replace />
  return children
}

/** Sign-in (and auth screens on `/`) — already logged in → dashboard. */
export function GuestOnly({ children }: { children: ReactNode }) {
  if (getToken()) return <Navigate to="/dashboard" replace />
  return children
}
