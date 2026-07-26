import { hasPermission } from "@/lib/rbac/access";
import type { ProjectStatus } from "@/lib/projects/constants";

type TProjectCardAccessInput = {
  permissions: readonly string[];
  userId?: string | null;
  ownerId?: string | null;
  isSuperAdmin: boolean;
};

export function canViewProjectCard({
  permissions,
  userId,
  ownerId,
  isSuperAdmin,
}: TProjectCardAccessInput): boolean {
  if (isSuperAdmin) return true;
  if (hasPermission(permissions, "projects.view")) return true;
  return Boolean(userId && ownerId && userId === ownerId);
}

export function canEditProjectCard({
  permissions,
  userId,
  ownerId,
  isSuperAdmin,
}: TProjectCardAccessInput): boolean {
  if (isSuperAdmin) return true;
  if (hasPermission(permissions, "projects.update")) return true;
  return Boolean(userId && ownerId && userId === ownerId);
}

/** Invite members — owners, super admins, or `members.invite`. Hidden for rejected projects. */
export function canInviteProjectMembers({
  permissions,
  userId,
  ownerId,
  isSuperAdmin,
  status,
}: TProjectCardAccessInput & { status: ProjectStatus }): boolean {
  if (status === "rejected") return false;
  if (isSuperAdmin) return true;
  if (hasPermission(permissions, "members.invite")) return true;
  return Boolean(userId && ownerId && userId === ownerId);
}

/**
 * Hard-delete — platform `projects.delete` (super_admin) only.
 * Allowed statuses: inactive or rejected.
 */
export function canDeleteProjectCard({
  platformPermissions,
  isSuperAdmin,
  status,
}: {
  platformPermissions: readonly string[];
  isSuperAdmin: boolean;
  status: ProjectStatus;
}): boolean {
  if (status !== "inactive" && status !== "rejected") return false;
  if (isSuperAdmin) return true;
  return hasPermission(platformPermissions, "projects.delete");
}
