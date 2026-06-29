/** Query key from reset email: `?password=reset-password&token=…&email=…` */
export const RESET_PASSWORD_QUERY_KEY = "password" as const
export const RESET_PASSWORD_QUERY_VALUE = "reset-password" as const

export type ResetPasswordLinkParams =
  | { valid: true; token: string; email: string }
  | { valid: false; reason: "missing_params" }

export function isResetPasswordUrl(searchParams: URLSearchParams): boolean {
  return searchParams.get(RESET_PASSWORD_QUERY_KEY) === RESET_PASSWORD_QUERY_VALUE
}

export function parseResetPasswordLinkParams(
  searchParams: URLSearchParams,
): ResetPasswordLinkParams | null {
  if (!isResetPasswordUrl(searchParams)) return null

  const token = searchParams.get("token")?.trim() ?? ""
  const email = searchParams.get("email")?.trim() ?? ""

  if (!token || !email) {
    return { valid: false, reason: "missing_params" }
  }

  return { valid: true, token, email }
}

export function clearResetPasswordSearchParams(
  searchParams: URLSearchParams,
): URLSearchParams {
  const next = new URLSearchParams(searchParams)
  next.delete(RESET_PASSWORD_QUERY_KEY)
  next.delete("token")
  next.delete("email")
  return next
}
