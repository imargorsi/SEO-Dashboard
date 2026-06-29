export type ResetPasswordLinkParams =
  | { valid: true; token: string; email: string }
  | { valid: false; reason: "missing_params" };

/** Parses `?token=…&email=…` on `/reset-password` (Laravel reset link). */
export function parseResetPasswordLinkParams(
  searchParams: URLSearchParams,
): ResetPasswordLinkParams {
  const token = searchParams.get("token")?.trim() ?? "";
  const email = searchParams.get("email")?.trim() ?? "";

  if (!token || !email) {
    return { valid: false, reason: "missing_params" };
  }

  return { valid: true, token, email };
}
