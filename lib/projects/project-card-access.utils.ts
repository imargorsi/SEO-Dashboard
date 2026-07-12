import { hasPermission } from "@/lib/rbac/access";

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
