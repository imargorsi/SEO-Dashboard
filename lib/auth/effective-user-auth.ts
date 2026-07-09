import type { UserDocument } from "@/models/User";
import { Project, ProjectMember, Role } from "@/models";
import { permissionsForRoles } from "@/lib/auth/rbac";

type EffectiveAuthData = {
  roles: string[];
  permissions: string[];
};

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
  const approvedProjects = await Project.find({
    _id: { $in: projectIds },
    status: "approved",
  }).select("_id");
  const approvedProjectIds = new Set(approvedProjects.map((project) => project._id.toString()));

  const approvedRoleIds = memberships
    .filter((membership) => approvedProjectIds.has(membership.projectId.toString()))
    .map((membership) => membership.roleId);

  if (approvedRoleIds.length === 0) {
    return {
      roles: [...new Set(platformRoles)].sort(),
      permissions: [...new Set(platformPermissions)].sort(),
    };
  }

  const projectRoles = await Role.find({
    _id: { $in: approvedRoleIds },
    scope: "project",
  }).select("slug permissions");

  const effectiveRoles = [...new Set([...platformRoles, ...projectRoles.map((role) => role.slug)])].sort();
  const projectPermissions = projectRoles.flatMap((role) => role.permissions);
  const effectivePermissions = [...new Set([...platformPermissions, ...projectPermissions])].sort();

  return {
    roles: effectiveRoles,
    permissions: effectivePermissions,
  };
}
