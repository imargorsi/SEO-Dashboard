export type AuthUser = {
  id: string;
  name: string;
  email: string;
  email_verified_at: string | null;
  company_id: string | null;
  roles: string[];
  permissions: string[];
  home_api_path?: string | null;
  profile_image?: string | null;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponseData = {
  token: string;
  token_type: "Bearer";
  user: AuthUser;
};

export type LoginResult = {
  token: string;
  tokenType: "Bearer";
  message: string | null;
  user: AuthUser;
};

export function normalizeAuthUser(raw: unknown): AuthUser | null {
  if (raw == null || typeof raw !== "object") return null;

  const record = raw as Record<string, unknown>;
  const id = typeof record.id === "string" ? record.id : null;
  const email = typeof record.email === "string" ? record.email.trim() : "";
  const name = typeof record.name === "string" ? record.name : "";

  if (!id || !email || !name) return null;

  const roles = Array.isArray(record.roles)
    ? record.roles.filter((role): role is string => typeof role === "string")
    : [];

  const permissions = Array.isArray(record.permissions)
    ? record.permissions.filter((permission): permission is string => typeof permission === "string")
    : [];

  const companyId =
    typeof record.company_id === "string" ? record.company_id : record.company_id === null ? null : null;

  const emailVerifiedAt = typeof record.email_verified_at === "string" ? record.email_verified_at : null;

  const homeApiPath = typeof record.home_api_path === "string" ? record.home_api_path : null;

  const profileImage =
    typeof record.profile_image === "string" ? record.profile_image : record.profile_image === null ? null : undefined;

  return {
    id,
    name,
    email,
    email_verified_at: emailVerifiedAt,
    company_id: companyId,
    roles,
    permissions,
    home_api_path: homeApiPath,
    ...(profileImage !== undefined ? { profile_image: profileImage } : {}),
  };
}
