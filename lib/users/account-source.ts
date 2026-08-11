/** Account provenance for platform users — admin Users UI only (not project roles). */

export const USER_ACCOUNT_SOURCES = ["admin", "self_register", "google", "unknown"] as const;
export type TUserAccountSource = (typeof USER_ACCOUNT_SOURCES)[number];

/** Known create paths — excludes `unknown` (legacy / unclear). */
export const USER_ACCOUNT_SOURCE_KNOWN = ["admin", "self_register", "google"] as const;
export type TUserAccountSourceKnown = (typeof USER_ACCOUNT_SOURCE_KNOWN)[number];

/** Verified-at ≈ created-at → treat as admin-provisioned (soft heuristic). */
export const ACCOUNT_SOURCE_ADMIN_VERIFY_WINDOW_MS = 5_000;

export type TAccountSourceInferInput = {
  accountSource?: string | null;
  googleId?: string | null;
  emailVerifiedAt?: Date | null;
  createdAt?: Date | null;
};

export function isKnownUserAccountSource(value: unknown): value is TUserAccountSourceKnown {
  return typeof value === "string" && (USER_ACCOUNT_SOURCE_KNOWN as readonly string[]).includes(value);
}

/**
 * Soft heuristic for legacy rows without a stored source.
 * Do not use for new creates — set `accountSource` explicitly in each create path.
 */
export function inferAccountSource(user: TAccountSourceInferInput): TUserAccountSource {
  if (typeof user.googleId === "string" && user.googleId.length > 0) {
    return "google";
  }

  if (!(user.emailVerifiedAt instanceof Date)) {
    return "self_register";
  }

  if (!(user.createdAt instanceof Date)) {
    return "unknown";
  }

  const deltaMs = user.emailVerifiedAt.getTime() - user.createdAt.getTime();

  // Admin create sets verifiedAt at insert time (≈ 0). Allow small clock skew.
  if (Math.abs(deltaMs) <= ACCOUNT_SOURCE_ADMIN_VERIFY_WINDOW_MS) {
    return "admin";
  }

  // Self-register verifies later via email link.
  if (deltaMs > ACCOUNT_SOURCE_ADMIN_VERIFY_WINDOW_MS) {
    return "self_register";
  }

  return "unknown";
}

/** Prefer an explicit known source; otherwise soft-infer for missing / unknown. */
export function resolveAccountSource(user: TAccountSourceInferInput): TUserAccountSource {
  if (isKnownUserAccountSource(user.accountSource)) {
    return user.accountSource;
  }
  return inferAccountSource(user);
}
