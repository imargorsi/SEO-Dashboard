import { describe, expect, it } from "vitest";

import { ValidationError } from "@/lib/api/http-errors";
import { hashPassword } from "@/lib/auth/password";
import { createProject } from "@/lib/projects/create-project";
import { PROJECT_OWNER_ROLE, PROJECT_USER_ROLE } from "@/lib/rbac/roles";
import { seedSystemRoles } from "@/lib/rbac/seed-roles";
import {
  removeAdminUserMembership,
  upsertAdminUserMembership,
} from "@/lib/users/admin-user-membership";
import { Role, User } from "@/models";
import { authContextFor, projectInput } from "@/tests/helpers/project-test-utils";

describe("Admin user project memberships", () => {
  it("assigns a user to a project with a selected role", async () => {
    await seedSystemRoles();

    const owner = await User.create({
      name: "Owner",
      email: "membership-owner@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
    });

    const lead = await User.create({
      name: "SEO Lead",
      email: "membership-lead@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
    });

    const { project } = await createProject(
      authContextFor(owner),
      projectInput({ businessName: "Lead Project", websiteUrl: "https://lead.example.com" }),
    );

    const userRole = await Role.findOne({ slug: PROJECT_USER_ROLE });
    expect(userRole).not.toBeNull();

    const { assignments } = await upsertAdminUserMembership(lead._id.toString(), {
      projectId: project._id.toString(),
      roleId: userRole!._id.toString(),
    });

    expect(assignments).toEqual([
      expect.objectContaining({
        id: project._id.toString(),
        membership_role: PROJECT_USER_ROLE,
        role_id: userRole!._id.toString(),
        membership_status: "active",
      }),
    ]);
  });

  it("rejects demoting the last active project owner", async () => {
    await seedSystemRoles();

    const owner = await User.create({
      name: "Solo Owner",
      email: "solo-owner@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
    });

    const { project } = await createProject(
      authContextFor(owner),
      projectInput({ businessName: "Solo Project", websiteUrl: "https://solo.example.com" }),
    );

    const userRole = await Role.findOne({ slug: PROJECT_USER_ROLE });

    await expect(
      upsertAdminUserMembership(owner._id.toString(), {
        projectId: project._id.toString(),
        roleId: userRole!._id.toString(),
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("rejects removing the last active project owner", async () => {
    await seedSystemRoles();

    const owner = await User.create({
      name: "Keep Owner",
      email: "keep-owner@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
    });

    const { project } = await createProject(
      authContextFor(owner),
      projectInput({ businessName: "Keep Project", websiteUrl: "https://keep.example.com" }),
    );

    await expect(
      removeAdminUserMembership(owner._id.toString(), project._id.toString()),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("allows demoting an owner when another active owner exists", async () => {
    await seedSystemRoles();

    const ownerA = await User.create({
      name: "Owner A",
      email: "owner-a@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
    });

    const ownerB = await User.create({
      name: "Owner B",
      email: "owner-b@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
    });

    const { project } = await createProject(
      authContextFor(ownerA),
      projectInput({ businessName: "Multi Owner", websiteUrl: "https://multi.example.com" }),
    );

    const ownerRole = await Role.findOne({ slug: PROJECT_OWNER_ROLE });
    const userRole = await Role.findOne({ slug: PROJECT_USER_ROLE });

    await upsertAdminUserMembership(ownerB._id.toString(), {
      projectId: project._id.toString(),
      roleId: ownerRole!._id.toString(),
    });

    const { assignments } = await upsertAdminUserMembership(ownerA._id.toString(), {
      projectId: project._id.toString(),
      roleId: userRole!._id.toString(),
    });

    expect(assignments[0]?.membership_role).toBe(PROJECT_USER_ROLE);
  });
});
