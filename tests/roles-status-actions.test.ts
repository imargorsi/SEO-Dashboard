import { describe, expect, it } from "vitest";

import { ValidationError } from "@/lib/api/http-errors";
import { hashPassword } from "@/lib/auth/password";
import { activateRole, deactivateRole } from "@/lib/roles/role-status-actions";
import { createRole } from "@/lib/roles/create-role";
import { assignProjectMember } from "@/lib/projects/assign-member";
import { createProject } from "@/lib/projects/create-project";
import { getProjectAccessForUser } from "@/lib/projects/get-project-access";
import { resolveProjectRoleBySlug } from "@/lib/projects/resolve-role";
import { projectPermission } from "@/lib/rbac/permission-catalog";
import { PROJECT_OWNER_ROLE } from "@/lib/rbac/roles";
import { seedSystemRoles } from "@/lib/rbac/seed-roles";
import { Project, Role, User } from "@/models";
import { authContextFor, projectInput } from "@/tests/helpers/project-test-utils";

describe("Role status (activate / deactivate)", () => {
  it("deactivates and re-activates a custom role with no members", async () => {
    const { role } = await createRole({ name: "Ghost", description: "", permissions: [] });
    const admin = authContextFor(
      await User.create({
        name: "Admin",
        email: "role-status-admin-1@example.com",
        password: await hashPassword("password"),
        emailVerifiedAt: new Date(),
        roles: ["super_admin"],
      })
    );

    const deactivated = await deactivateRole(admin, role._id.toString());
    expect(deactivated.status).toBe("inactive");

    const activated = await activateRole(admin, role._id.toString());
    expect(activated.status).toBe("active");
  });

  it("rejects deactivating a role assigned to an active project member", async () => {
    const { role } = await createRole({
      name: "Analyst",
      description: "",
      permissions: [projectPermission("leads", "view")],
    });
    const admin = authContextFor(
      await User.create({
        name: "Admin",
        email: "role-status-admin-2@example.com",
        password: await hashPassword("password"),
        emailVerifiedAt: new Date(),
        roles: ["super_admin"],
      })
    );
    const owner = await User.create({
      name: "Owner",
      email: "role-status-owner-2@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
    });
    const member = await User.create({
      name: "Member",
      email: "role-status-member-2@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
    });

    const { project } = await createProject(
      authContextFor(owner),
      projectInput({ businessName: "Assigned Role Project", websiteUrl: "https://assigned.example.com" })
    );
    await assignProjectMember({ projectId: project._id, userId: member._id, roleSlug: role.slug, status: "active" });

    await expect(deactivateRole(admin, role._id.toString())).rejects.toBeInstanceOf(ValidationError);

    const unchanged = await Role.findById(role._id);
    expect(unchanged!.status).toBe("active");
  });

  it("rejects deactivating a role with a pending (invited) assignment", async () => {
    const { role } = await createRole({ name: "Pending Reviewer", description: "", permissions: [] });
    const admin = authContextFor(
      await User.create({
        name: "Admin",
        email: "role-status-admin-3@example.com",
        password: await hashPassword("password"),
        emailVerifiedAt: new Date(),
        roles: ["super_admin"],
      })
    );
    const owner = await User.create({
      name: "Owner",
      email: "role-status-owner-3@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
    });
    const invitee = await User.create({
      name: "Invitee",
      email: "role-status-invitee-3@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
    });

    const { project } = await createProject(
      authContextFor(owner),
      projectInput({ businessName: "Invited Role Project", websiteUrl: "https://invited.example.com" })
    );
    await assignProjectMember({
      projectId: project._id,
      userId: invitee._id,
      roleSlug: role.slug,
      status: "invited",
    });

    await expect(deactivateRole(admin, role._id.toString())).rejects.toBeInstanceOf(ValidationError);
  });

  it("rejects deactivating a system role even with no assignments", async () => {
    await seedSystemRoles();
    const ownerRole = await Role.findOne({ slug: PROJECT_OWNER_ROLE });
    const admin = authContextFor(
      await User.create({
        name: "Admin",
        email: "role-status-admin-4@example.com",
        password: await hashPassword("password"),
        emailVerifiedAt: new Date(),
        roles: ["super_admin"],
      })
    );

    await expect(deactivateRole(admin, ownerRole!._id.toString())).rejects.toBeInstanceOf(ValidationError);
  });

  it("rejects assigning an inactive role", async () => {
    const { role } = await createRole({ name: "Retired", description: "", permissions: [] });
    const admin = authContextFor(
      await User.create({
        name: "Admin",
        email: "role-status-admin-5@example.com",
        password: await hashPassword("password"),
        emailVerifiedAt: new Date(),
        roles: ["super_admin"],
      })
    );
    await deactivateRole(admin, role._id.toString());

    await expect(resolveProjectRoleBySlug(role.slug)).rejects.toBeInstanceOf(ValidationError);
  });

  it("grants no permissions from an inactive role, even if still referenced by a membership", async () => {
    const { role } = await createRole({
      name: "Viewer",
      description: "",
      permissions: [projectPermission("leads", "view")],
    });
    const owner = await User.create({
      name: "Owner",
      email: "role-status-owner-6@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
    });
    const member = await User.create({
      name: "Member",
      email: "role-status-member-6@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
    });

    const { project } = await createProject(
      authContextFor(owner),
      projectInput({ businessName: "Inert Role Project", websiteUrl: "https://inert.example.com" })
    );
    await Project.findByIdAndUpdate(project._id, { status: "active" });
    await assignProjectMember({ projectId: project._id, userId: member._id, roleSlug: role.slug, status: "active" });

    const beforeAccess = await getProjectAccessForUser(authContextFor(member), project._id.toString());
    expect(beforeAccess!.permissions).toContain(projectPermission("leads", "view"));

    // Simulate a role becoming inactive out-of-band (deactivateRole itself would block this
    // while a membership exists) — access resolution must still treat it as inert.
    await Role.findByIdAndUpdate(role._id, { status: "inactive" });

    const afterAccess = await getProjectAccessForUser(authContextFor(member), project._id.toString());
    expect(afterAccess!.permissions).not.toContain(projectPermission("leads", "view"));
    expect(afterAccess!.permissions).toEqual([]);
  });
});
