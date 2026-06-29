import { env } from "@/lib/config/env";
import type { CompanyDocument } from "@/models/Company";
import type { UserDocument } from "@/models/User";

export function serializeCompany(company: CompanyDocument, usersCount?: number) {
  return {
    id: company._id.toString(),
    name: company.name,
    slug: company.slug,
    status: company.status,
    is_active: company.isActive,
    poc_name: company.pocName,
    poc_email: company.pocEmail,
    ...(usersCount !== undefined ? { users_count: usersCount } : {}),
    created_at: company.createdAt,
    updated_at: company.updatedAt,
  };
}

type UserSerializeOptions = {
  roles: string[];
  permissions: string[];
  includeHomeApiPath?: boolean;
};

function profileImageUrl(profileImage: string | null | undefined): string | null {
  if (!profileImage) return null;
  const base = env.appUrl().replace(/\/$/, "");
  return `${base}/storage/${profileImage.replace(/^\//, "")}`;
}

function homeApiPath(roles: string[]): string | null {
  if (roles.includes("super_admin")) return "/api/v1/admin/dashboard";
  if (roles.includes("company_admin")) return "/api/v1/company/dashboard";
  return null;
}

export function serializeUser(user: UserDocument, options: UserSerializeOptions) {
  const payload: Record<string, unknown> = {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    profile_image: profileImageUrl(user.profileImage),
    email_verified_at: user.emailVerifiedAt,
    company_id: user.companyId ? user.companyId.toString() : null,
    roles: options.roles,
    permissions: options.permissions,
  };

  if (options.includeHomeApiPath !== false) {
    payload.home_api_path = homeApiPath(options.roles);
  }

  return payload;
}
