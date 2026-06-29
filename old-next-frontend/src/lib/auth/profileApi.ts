import { api, API_ORIGIN } from "@/lib/api"

export const ME_PROFILE_ENDPOINT = "/v1/me/profile" as const

/** Raw API may use `profile_image`, `Profile_image`, etc. */
export function pickProfileImageFromRecord(
  data: Record<string, unknown>,
): string | null {
  const v =
    data.profile_image ??
    data.Profile_image ??
    data.profileImage ??
    data.ProfileImage
  if (typeof v === "string" && v.trim()) return v.trim()
  return null
}

export function resolveProfileAssetUrl(
  path: string | null | undefined,
): string | null {
  if (!path || !path.trim()) return null
  const p = path.trim()
  if (p.startsWith("http://") || p.startsWith("https://")) return p
  if (p.startsWith("/")) return `${API_ORIGIN}${p}`
  return `${API_ORIGIN}/${p}`
}

export type MeProfile = {
  id: number
  name: string
  email: string
  email_verified_at: string | null
  company_id: number | null
  roles: string[]
  permissions: string[]
  home_api_path: string
  profile_image: string | null
}

export function parseMeProfile(data: Record<string, unknown>): MeProfile | null {
  const idRaw = data.id
  const id =
    typeof idRaw === "number" && Number.isFinite(idRaw)
      ? idRaw
      : typeof idRaw === "string" && /^\d+$/.test(idRaw)
        ? Number(idRaw)
        : null
  if (id == null) return null

  const name = typeof data.name === "string" ? data.name : ""
  const email = typeof data.email === "string" ? data.email.trim() : ""
  if (!email) return null

  const eva = data.email_verified_at
  const email_verified_at =
    typeof eva === "string" && eva.trim() ? eva.trim() : null

  const cid = data.company_id
  let company_id: number | null = null
  if (typeof cid === "number" && Number.isFinite(cid)) company_id = cid
  else if (typeof cid === "string" && /^\d+$/.test(cid)) company_id = Number(cid)
  else if (cid === null) company_id = null

  const roles = Array.isArray(data.roles)
    ? data.roles.filter((r): r is string => typeof r === "string")
    : []
  const permissions = Array.isArray(data.permissions)
    ? data.permissions.filter((p): p is string => typeof p === "string")
    : []

  const home =
    typeof data.home_api_path === "string" ? data.home_api_path.trim() : ""

  return {
    id,
    name,
    email,
    email_verified_at,
    company_id,
    roles,
    permissions,
    home_api_path: home,
    profile_image: pickProfileImageFromRecord(data),
  }
}

export type MeProfileApiResponse = {
  success: boolean
  message: string | null
  data?: Record<string, unknown> | null
}

export type PatchProfileApiResponse = {
  success: boolean
  message: string | null
  data?: Record<string, unknown> | null
  errors?: Partial<Record<"name" | "email" | "profile_image", string[]>> &
    Record<string, string[] | undefined>
}

export async function fetchMeProfile(): Promise<MeProfile> {
  const json = await api.get<MeProfileApiResponse>(ME_PROFILE_ENDPOINT)
  if (!json.success || json.data == null || typeof json.data !== "object") {
    const msg =
      (typeof json.message === "string" && json.message.trim()) ||
      "Could not load profile."
    throw new Error(msg)
  }
  const parsed = parseMeProfile(json.data as Record<string, unknown>)
  if (!parsed) throw new Error("Invalid profile response.")
  return parsed
}

export function patchMeProfile(params: {
  name: string
  email: string
  profileImageFile?: File | null
}) {
  const name = params.name.trim()
  // const email = params.email.trim()
  if (params.profileImageFile) {
    const fd = new FormData()
    fd.append("name", name)
    // fd.append("email", email)
    fd.append("profile_image", params.profileImageFile)
    return api.post<PatchProfileApiResponse>(ME_PROFILE_ENDPOINT, fd)
  }
  return api.post<PatchProfileApiResponse>(ME_PROFILE_ENDPOINT, {
    name,
    // email,
  })
}
