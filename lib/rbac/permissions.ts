import { Types } from "mongoose";
import { Permission, Role, RolePermission, UserPermission, UserRole } from "@/models";

const GUARD = "web";

const ADMIN_PERMISSIONS = [
  "admin.dashboard.view",
  "admin.companies.view",
  "admin.companies.create",
  "admin.companies.update",
  "admin.companies.delete",
  "admin.roles.view",
  "admin.roles.create",
  "admin.roles.update",
  "admin.roles.delete",
  "admin.permissions.view",
  "admin.permissions.create",
  "admin.permissions.update",
  "admin.permissions.delete",
] as const;

const COMPANY_ADMIN_PERMISSIONS = ["company.dashboard.view", "company.profile.view", "company.profile.update"] as const;

export async function findOrCreateRole(name: string): Promise<Types.ObjectId> {
  const role = await Role.findOneAndUpdate(
    { name, guardName: GUARD },
    { $setOnInsert: { name, guardName: GUARD } },
    { upsert: true, returnDocument: "after" }
  );
  return role._id;
}

export async function findOrCreatePermission(name: string): Promise<Types.ObjectId> {
  const permission = await Permission.findOneAndUpdate(
    { name, guardName: GUARD },
    { $setOnInsert: { name, guardName: GUARD } },
    { upsert: true, returnDocument: "after" }
  );
  return permission._id;
}

export async function syncRolePermissions(roleName: string, permissionNames: readonly string[]): Promise<void> {
  const roleId = await findOrCreateRole(roleName);
  const permissionIds: Types.ObjectId[] = [];

  for (const name of permissionNames) {
    permissionIds.push(await findOrCreatePermission(name));
  }

  await RolePermission.deleteMany({ roleId });
  if (permissionIds.length > 0) {
    await RolePermission.insertMany(
      permissionIds.map((permissionId) => ({ roleId, permissionId })),
      { ordered: false }
    );
  }
}

export async function syncSuperAdminWithAllPermissions(): Promise<void> {
  const roleId = await findOrCreateRole("super_admin");
  const allPermissions = await Permission.find({ guardName: GUARD }).select("_id");
  await RolePermission.deleteMany({ roleId });
  if (allPermissions.length > 0) {
    await RolePermission.insertMany(
      allPermissions.map((p) => ({ roleId, permissionId: p._id })),
      { ordered: false }
    );
  }
}

export async function seedRolesAndPermissions(): Promise<void> {
  const allNames = [...ADMIN_PERMISSIONS, ...COMPANY_ADMIN_PERMISSIONS];
  for (const name of allNames) {
    await findOrCreatePermission(name);
  }
  await syncRolePermissions("company_admin", COMPANY_ADMIN_PERMISSIONS);
  await syncSuperAdminWithAllPermissions();
}

export async function assignRoleToUser(userId: Types.ObjectId, roleName: string): Promise<void> {
  const roleId = await findOrCreateRole(roleName);
  await UserRole.findOneAndUpdate({ userId, roleId }, { $setOnInsert: { userId, roleId } }, { upsert: true });
}

export async function userHasRole(userId: Types.ObjectId, roleName: string): Promise<boolean> {
  const role = await Role.findOne({ name: roleName, guardName: GUARD });
  if (!role) return false;
  const assignment = await UserRole.findOne({ userId, roleId: role._id });
  return assignment !== null;
}

export async function getUserRoleNames(userId: Types.ObjectId): Promise<string[]> {
  const assignments = await UserRole.find({ userId }).populate<{ roleId: { name: string } }>({
    path: "roleId",
    select: "name",
  });
  return assignments.map((a) => a.roleId?.name).filter((name): name is string => typeof name === "string");
}

export async function getUserPermissionNames(userId: Types.ObjectId): Promise<string[]> {
  const direct = await UserPermission.find({ userId }).populate<{ permissionId: { name: string } }>({
    path: "permissionId",
    select: "name",
  });

  const roleAssignments = await UserRole.find({ userId });
  const roleIds = roleAssignments.map((a) => a.roleId);
  const rolePerms = await RolePermission.find({ roleId: { $in: roleIds } }).populate<{
    permissionId: { name: string };
  }>({
    path: "permissionId",
    select: "name",
  });

  const names = new Set<string>();
  for (const entry of direct) {
    if (entry.permissionId?.name) names.add(entry.permissionId.name);
  }
  for (const entry of rolePerms) {
    if (entry.permissionId?.name) names.add(entry.permissionId.name);
  }

  return [...names].sort();
}

export { ADMIN_PERMISSIONS, COMPANY_ADMIN_PERMISSIONS };
