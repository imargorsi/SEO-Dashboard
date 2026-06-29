import { useMemo, useSyncExternalStore } from "react"
import { normalizeAuthUser, type AuthUser } from "@/lib/auth/authApi.types"
import {
  getStoredAuthUserRawSnapshot,
  subscribeAuthUser,
} from "@/lib/auth/sessionUser.ts"

/** Reactive snapshot of the cached login user (localStorage `auth_user`). */
export function useAuthUser(): AuthUser | null {
  const raw = useSyncExternalStore(
    subscribeAuthUser,
    getStoredAuthUserRawSnapshot,
    () => "",
  )

  return useMemo(() => {
    if (!raw) return null
    try {
      return normalizeAuthUser(JSON.parse(raw))
    } catch {
      return null
    }
  }, [raw])
}
