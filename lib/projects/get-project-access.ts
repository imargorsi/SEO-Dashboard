import mongoose from "mongoose";
import { NextResponse } from "next/server";

import { ApiResponse } from "@/lib/api/response";
import type { AuthContext } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/rbac/access";
import { allProjectCatalogPermissions, projectPermission } from "@/lib/rbac/permission-catalog";
import { SUPER_ADMIN_ROLE } from "@/lib/rbac/roles";
import { Project, ProjectMember, Role } from "@/models";

const PENDING_PROJECT_ACCESS_PERMISSIONS = [
  projectPermission("projects", "view"),
  projectPermission("projects", "update"),
] as const;

const INACTIVE_PROJECT_ACCESS_PERMISSIONS = [
  projectPermission("projects", "view"),
  projectPermission("projects", "update"),
] as const;

export type ProjectAccessDto = {
  projectId: string;
  roles: string[];
  permissions: string[];
};

export async function getProjectAccessForUser(
  auth: AuthContext,
  projectId: string,
): Promise<ProjectAccessDto | null> {
  if (!mongoose.isValidObjectId(projectId)) {
    return null;
  }

  const isAdmin = auth.user.roles.includes(SUPER_ADMIN_ROLE);
  if (isAdmin) {
    const project = await Project.findById(projectId).select("_id status");
    if (!project || project.status === "rejected") {
      return null;
    }

    return {
      projectId,
      roles: [SUPER_ADMIN_ROLE],
      permissions: [...allProjectCatalogPermissions()],
    };
  }

  const membership = await ProjectMember.findOne({
    projectId,
    userId: auth.user._id,
    status: "active",
  }).select("roleId");

  if (!membership) {
    return null;
  }

  const project = await Project.findById(projectId).select("status");
  if (!project || project.status === "rejected") {
    return null;
  }

  const role = await Role.findById(membership.roleId).select("slug permissions");
  const roleSlug = role?.slug ?? null;
  const rolePermissions = role?.permissions ? [...role.permissions] : [];
  const memberManagementPermissions = rolePermissions.filter((permission) =>
    permission.startsWith("members."),
  );

  if (project.status === "pending") {
    return {
      projectId,
      roles: roleSlug ? [roleSlug] : [],
      permissions: [
        ...new Set([...PENDING_PROJECT_ACCESS_PERMISSIONS, ...memberManagementPermissions]),
      ],
    };
  }

  if (project.status === "inactive") {
    return {
      projectId,
      roles: roleSlug ? [roleSlug] : [],
      permissions: [
        ...new Set([...INACTIVE_PROJECT_ACCESS_PERMISSIONS, ...memberManagementPermissions]),
      ],
    };
  }

  if (project.status !== "active") {
    return null;
  }

  return {
    projectId,
    roles: roleSlug ? [roleSlug] : [],
    permissions: role?.permissions ? [...role.permissions] : [],
  };
}

export async function requireProjectPermission(
  auth: AuthContext,
  projectId: string,
  permission: string,
): Promise<NextResponse | null> {
  const access = await getProjectAccessForUser(auth, projectId);
  if (!access) {
    return ApiResponse.error("Forbidden.", {}, 403);
  }

  if (!hasPermission(access.permissions, permission)) {
    return ApiResponse.error("Forbidden.", {}, 403);
  }

  return null;
}

export function buildProjectAccessResponse(access: ProjectAccessDto): NextResponse {
  return ApiResponse.success(access);
}
