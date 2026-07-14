import { NextResponse } from "next/server";
import {
  authenticateRequest,
  loadUserAuthData,
  requireActiveUser,
  requireRole,
  requireVerifiedEmail,
  type AuthContext,
} from "@/lib/auth/guards";
import { hasAnyPermission } from "@/lib/rbac/access";
import { SUPER_ADMIN_ROLE } from "@/lib/rbac/roles";
import { ApiResponse } from "@/lib/api/response";
import { authMessages } from "@/lib/auth/messages";

export type ApiGuardOptions = {
  /** Require a verified email (default: true). */
  verified?: boolean;
  /** Require `super_admin` on `User.roles`. */
  superAdmin?: boolean;
  /** Require an exact platform permission from `User.roles`. */
  permission?: string;
  /** Require any one of these platform permissions. */
  anyPermission?: readonly string[];
};

async function requirePlatformPermission(
  auth: AuthContext,
  permission: string,
): Promise<NextResponse | null> {
  const { permissions } = await loadUserAuthData(auth.user);
  if (!permissions.includes(permission)) {
    return ApiResponse.error("Forbidden.", {}, 403);
  }
  return null;
}

async function requireAnyPlatformPermission(
  auth: AuthContext,
  candidates: readonly string[],
): Promise<NextResponse | null> {
  const { permissions } = await loadUserAuthData(auth.user);
  if (!hasAnyPermission(permissions, candidates)) {
    return ApiResponse.error("Forbidden.", {}, 403);
  }
  return null;
}

/**
 * Authenticate and enforce optional platform guards for API routes.
 * Project-scoped guards (`requireProjectAccess`) are added in Module 6.
 */
export async function runApiGuards(
  request: Request,
  options: ApiGuardOptions = {},
): Promise<AuthContext | NextResponse> {
  const { verified = true, superAdmin = false, permission, anyPermission } = options;

  const auth = await authenticateRequest(request);
  if (!auth) {
    return ApiResponse.error(authMessages.unauthenticated, {}, 401);
  }

  const activeError = await requireActiveUser(auth);
  if (activeError) return activeError;

  if (verified) {
    const verifiedError = await requireVerifiedEmail(auth);
    if (verifiedError) return verifiedError;
  }

  if (superAdmin) {
    const roleError = await requireRole(auth, SUPER_ADMIN_ROLE);
    if (roleError) return roleError;
  }

  if (permission) {
    const permissionError = await requirePlatformPermission(auth, permission);
    if (permissionError) return permissionError;
  }

  if (anyPermission?.length) {
    const anyError = await requireAnyPlatformPermission(auth, anyPermission);
    if (anyError) return anyError;
  }

  return auth;
}
