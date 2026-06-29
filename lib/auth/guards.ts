import { NextResponse } from "next/server";
import { findAccessToken } from "@/lib/auth/tokens";
import { getUserPermissionNames, getUserRoleNames } from "@/lib/rbac/permissions";
import { Company, User, type UserDocument } from "@/models";
import type { Types } from "mongoose";
import { ApiResponse } from "@/lib/api/response";
import { authMessages } from "@/lib/auth/messages";
import { connectDb } from "@/lib/db/mongoose";

export type AuthContext = {
  user: UserDocument;
  token: string;
  tokenId: Types.ObjectId;
};

function bearerToken(request: Request): string | null {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice("Bearer ".length).trim() || null;
}

export async function authenticateRequest(request: Request): Promise<AuthContext | null> {
  await connectDb();
  const token = bearerToken(request);
  const found = await findAccessToken(token);
  if (!found || !token) return null;

  const user = await User.findById(found.userId);
  if (!user) return null;

  return { user, token, tokenId: found.tokenId };
}

export async function requireAuth(request: Request): Promise<AuthContext | NextResponse> {
  const auth = await authenticateRequest(request);
  if (!auth) {
    return ApiResponse.error(authMessages.unauthenticated, {}, 401);
  }
  return auth;
}

export async function requireVerifiedEmail(
  auth: AuthContext,
): Promise<NextResponse | null> {
  if (!auth.user.hasVerifiedEmail()) {
    return ApiResponse.error(authMessages.unverifiedEmail, {}, 403);
  }
  return null;
}

export async function requireRole(
  auth: AuthContext,
  ...roles: string[]
): Promise<NextResponse | null> {
  const userRoles = await getUserRoleNames(auth.user._id);
  const allowed = roles.some((role) => userRoles.includes(role));
  if (!allowed) {
    return ApiResponse.error("Forbidden.", {}, 403);
  }
  return null;
}

export async function requireCompanyAccount(
  auth: AuthContext,
): Promise<NextResponse | null> {
  if (!auth.user.companyId) {
    return ApiResponse.error("Forbidden.", {}, 403);
  }

  const company = await Company.findById(auth.user.companyId);
  if (!company || !company.isAccessible()) {
    return ApiResponse.error("Forbidden.", {}, 403);
  }

  return null;
}

export async function loadUserAuthData(userId: Types.ObjectId): Promise<{
  roles: string[];
  permissions: string[];
}> {
  const [roles, permissions] = await Promise.all([
    getUserRoleNames(userId),
    getUserPermissionNames(userId),
  ]);
  return { roles, permissions };
}
