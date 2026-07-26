import { describe, expect, it } from "vitest";

import { hashPassword } from "@/lib/auth/password";
import { ValidationError, NotFoundError } from "@/lib/api/http-errors";
import { SUPER_ADMIN_ROLE } from "@/lib/rbac/roles";
import { seedSystemRoles } from "@/lib/rbac/seed-roles";
import { deleteProject } from "@/lib/projects/delete-project";
import { deleteAdminUser } from "@/lib/users/delete-user";
import { createRole } from "@/lib/roles/create-role";
import { deleteRole } from "@/lib/roles/delete-role";
import { Project, ProjectMember, Role, SeoActivity, User } from "@/models";
import { authContextFor } from "@/tests/helpers/project-test-utils";

describe("Hard delete — projects, users, roles", () => {
  it("deletes inactive projects and cascades members + activities", async () => {
    await seedSystemRoles();

    const admin = await User.create({
      name: "Delete Admin",
      email: "delete-project-admin@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [SUPER_ADMIN_ROLE],
      status: "active",
    });

    const ownerRole = await Role.findOne({ slug: "project_owner" });
    expect(ownerRole).toBeTruthy();

    const project = await Project.create({
      businessName: "Delete Me Co",
      websiteUrl: "https://delete-me.example",
      status: "inactive",
      createdByUserId: admin._id,
      seoGoals: ["grow_brand_awareness"],
    });

    await ProjectMember.create({
      projectId: project._id,
      userId: admin._id,
      roleId: ownerRole!._id,
      status: "active",
    });

    await SeoActivity.create({
      projectId: project._id,
      activityType: "blogs",
      title: "Post",
      url: "https://example.com/post",
      occurredOn: "2026-01-01",
      createdBy: admin._id,
      updatedBy: admin._id,
    });

    await deleteProject(authContextFor(admin), project._id.toString());

    expect(await Project.findById(project._id)).toBeNull();
    expect(await ProjectMember.countDocuments({ projectId: project._id })).toBe(0);
    expect(await SeoActivity.countDocuments({ projectId: project._id })).toBe(0);
  });

  it("rejects deleting active projects", async () => {
    const admin = await User.create({
      name: "Active Project Admin",
      email: "delete-active-project@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [SUPER_ADMIN_ROLE],
      status: "active",
    });

    const project = await Project.create({
      businessName: "Still Active",
      websiteUrl: "https://active.example",
      status: "active",
      createdByUserId: admin._id,
      seoGoals: ["grow_brand_awareness"],
    });

    await expect(deleteProject(authContextFor(admin), project._id.toString())).rejects.toBeInstanceOf(
      ValidationError,
    );
    expect(await Project.findById(project._id)).not.toBeNull();
  });

  it("deletes inactive users and blocks self / active / missing", async () => {
    const admin = await User.create({
      name: "User Delete Admin",
      email: "delete-user-admin@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
      status: "active",
    });

    const inactive = await User.create({
      name: "Gone User",
      email: "gone-user@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
      status: "inactive",
    });

    const active = await User.create({
      name: "Active User",
      email: "still-active-user@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
      status: "active",
    });

    await deleteAdminUser(authContextFor(admin), inactive._id.toString());
    expect(await User.findById(inactive._id)).toBeNull();

    await expect(deleteAdminUser(authContextFor(admin), admin._id.toString())).rejects.toBeInstanceOf(
      ValidationError,
    );
    await expect(deleteAdminUser(authContextFor(admin), active._id.toString())).rejects.toBeInstanceOf(
      ValidationError,
    );
    await expect(deleteAdminUser(authContextFor(admin), "000000000000000000000000")).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it("deletes inactive custom roles and blocks system / active", async () => {
    await seedSystemRoles();

    const admin = await User.create({
      name: "Role Delete Admin",
      email: "delete-role-admin@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [SUPER_ADMIN_ROLE],
      status: "active",
    });

    const { role: custom } = await createRole({
      name: "Temp Custom Delete",
      description: "Temporary",
      permissions: ["projects.view"],
    });
    custom.status = "inactive";
    await custom.save();

    await deleteRole(authContextFor(admin), custom._id.toString());
    expect(await Role.findById(custom._id)).toBeNull();

    const system = await Role.findOne({ slug: "project_owner" });
    expect(system).toBeTruthy();
    await expect(deleteRole(authContextFor(admin), system!._id.toString())).rejects.toBeInstanceOf(
      ValidationError,
    );

    const { role: activeCustom } = await createRole({
      name: "Active Custom Delete",
      description: "Active",
      permissions: ["projects.view"],
    });

    await expect(deleteRole(authContextFor(admin), activeCustom._id.toString())).rejects.toBeInstanceOf(
      ValidationError,
    );
  });
});
