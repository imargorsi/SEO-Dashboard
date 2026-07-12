import type { UserDocument } from "@/models/User";
import { Project, ProjectMember, Role } from "@/models";
import { permissionsForRoles } from "@/lib/auth/rbac";
import { projectPermission } from "@/lib/rbac/permission-catalog";

type EffectiveAuthData = {
  roles: string[];
  permissions: string[];
};

const PENDING_PROJECT_ACCESS_PERMISSIONS = [
  projectPermission("projects", "view"),
  projectPermission("projects", "update"),
] as const;

export async function loadEffectiveUserAuthData(user: UserDocument): Promise<EffectiveAuthData> {
  const platformRoles = user.roles ?? [];
  const platformPermissions = permissionsForRoles(platformRoles);

  const memberships = await ProjectMember.find({
    userId: user._id,
    status: "active",
  }).select("projectId roleId");

  if (memberships.length === 0) {
    return {
      roles: [...new Set(platformRoles)].sort(),
      permissions: [...new Set(platformPermissions)].sort(),
    };
  }

  const projectIds = memberships.map((membership) => membership.projectId);
  const memberProjects = await Project.find({
    _id: { $in: projectIds },
  }).select("_id status");

  const activeProjectIds = new Set(
    memberProjects.filter((project) => project.status === "active").map((project) => project._id.toString()),
  );
  const pendingProjectIds = new Set(
    memberProjects.filter((project) => project.status === "pending").map((project) => project._id.toString()),
  );

  const activeRoleIds = memberships
    .filter((membership) => activeProjectIds.has(membership.projectId.toString()))
    .map((membership) => membership.roleId);

  const pendingAccessPermissions = pendingProjectIds.size > 0 ? [...PENDING_PROJECT_ACCESS_PERMISSIONS] : [];

  if (activeRoleIds.length === 0) {
    return {
      roles: [...new Set(platformRoles)].sort(),
      permissions: [...new Set([...platformPermissions, ...pendingAccessPermissions])].sort(),
    };
  }

  const projectRoles = await Role.find({
    _id: { $in: activeRoleIds },
    scope: "project",
  }).select("slug permissions");

  const effectiveRoles = [...new Set([...platformRoles, ...projectRoles.map((role) => role.slug)])].sort();
  const projectPermissions = projectRoles.flatMap((role) => role.permissions);
  const effectivePermissions = [
    ...new Set([...platformPermissions, ...projectPermissions, ...pendingAccessPermissions]),
  ].sort();

  return {
    roles: effectiveRoles,
    permissions: effectivePermissions,
  };
}
