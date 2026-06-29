/** Authenticated user payload from `/v1/auth/*` style APIs */
export type AuthUser = {
  id: number
  name: string
  email: string
  email_verified_at: string | null
  company_id: number | null
  roles: string[]
  permissions: string[]
  home_api_path: string
  /** Avatar URL from API (relative or absolute); optional for older cached sessions */
  profile_image?: string | null
}

/** `data` may be flat (`token` + user fields) or nested `{ token, user }`. */
export type LoginResponseData = {
  token?: string
  access_token?: string
  bearer_token?: string
  user?: AuthUser
} & Partial<AuthUser>

export type LoginApiResponse = {
  success?: boolean | number
  message: string | null
  data?: LoginResponseData | null
}

export type LogoutApiResponse = {
  success?: boolean | number
  message: string | null
  data?: null
}

/** Coerce API / localStorage user shapes into `AuthUser` (tolerates string ids, missing arrays). */
export function normalizeAuthUser(raw: unknown): AuthUser | null {
  if (raw == null || typeof raw !== "object") return null
  const o = raw as Record<string, unknown>

  const idRaw = o.id
  let id: number | null = null
  if (typeof idRaw === "number" && Number.isFinite(idRaw)) id = idRaw
  else if (typeof idRaw === "string" && /^\d+$/.test(idRaw)) id = Number(idRaw)
  if (id == null) return null

  if (typeof o.email !== "string" || !o.email.trim()) return null
  if (typeof o.name !== "string") return null

  const roles = Array.isArray(o.roles)
    ? o.roles.filter((r): r is string => typeof r === "string")
    : []
  const permissions = Array.isArray(o.permissions)
    ? o.permissions.filter((p): p is string => typeof p === "string")
    : []

  const home =
    typeof o.home_api_path === "string" ? o.home_api_path : ""

  const profileRaw =
    o.profile_image ?? o.Profile_image ?? o.profileImage ?? o.ProfileImage
  const profile_image =
    typeof profileRaw === "string" && profileRaw.trim()
      ? profileRaw.trim()
      : profileRaw === null || profileRaw === ""
        ? null
        : undefined

  const eva = o.email_verified_at
  const email_verified_at = typeof eva === "string" ? eva : null

  const cid = o.company_id
  const company_id: number | null =
    typeof cid === "number" && Number.isFinite(cid) ? cid : cid === null ? null : null

  return {
    id,
    name: o.name,
    email: o.email.trim(),
    email_verified_at,
    company_id,
    roles,
    permissions,
    home_api_path: home,
    ...(profile_image !== undefined ? { profile_image } : {}),
  }
}

export function extractBearerToken(data: LoginResponseData | null | undefined): string | null {
  if (!data) return null
  const raw = data.token ?? data.access_token ?? data.bearer_token
  return typeof raw === "string" && raw.length > 0 ? raw : null
}

export function extractAuthUser(data: LoginResponseData): AuthUser | null {
  if (data.user != null) {
    const fromNested = normalizeAuthUser(data.user)
    if (fromNested) return fromNested
  }
  const rest = Object.fromEntries(
    Object.entries(data as Record<string, unknown>).filter(
      ([key]) =>
        key !== "token" &&
        key !== "access_token" &&
        key !== "bearer_token" &&
        key !== "user",
    ),
  )
  return normalizeAuthUser(rest)
}
