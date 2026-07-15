import { describe, expect, it } from "vitest";

import { hashPassword } from "@/lib/auth/password";
import { NotFoundError, ValidationError } from "@/lib/api/http-errors";
import { createProject } from "@/lib/projects/create-project";
import { assignProjectMember } from "@/lib/projects/assign-member";
import { getProjectAccessForUser } from "@/lib/projects/get-project-access";
import { projectPermission } from "@/lib/rbac/permission-catalog";
import { seedSystemRoles } from "@/lib/rbac/seed-roles";
import { PROJECT_OWNER_ROLE, PROJECT_USER_ROLE } from "@/lib/rbac/roles";
import { createRole } from "@/lib/roles/create-role";
import { getAdminRoleById } from "@/lib/roles/get-role";
import { updateRole } from "@/lib/roles/update-role";
import { Project, Role, User } from "@/models";
import { authContextFor, projectInput } from "@/tests/helpers/project-test-utils";

describe("PATCH /admin/roles/{id} — updateRole", () => {
  it("updates name, description and permissions for a custom role", async () => {
    const { role } = await createRole({ name: "Reviewer", description: "Old", permissions: [] });

    const { role: updated } = await updateRole(role._id.toString(), {
      name: "Senior Reviewer",
      description: "Reviews everything.",
      permissions: [projectPermission("leads", "view")],
    });

    expect(updated.name).toBe("Senior Reviewer");
    expect(updated.description).toBe("Reviews everything.");
    expect(updated.permissions).toEqual([projectPermission("leads", "view")]);
  });

  it("404s for the reserved super_admin role (never editable)", async () => {
    const superAdminRole = await Role.create({
      slug: "super_admin",
      name: "Super Admin",
      description: "",
      scope: "platform",
      isSystem: true,
      permissions: [],
    });

    await expect(
      updateRole(superAdminRole._id.toString(), { name: "Hacked", description: "", permissions: [] }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("rejects renaming a system project role but allows permission edits", async () => {
    await seedSystemRoles();
    const owner = await getAdminRoleById((await Role.findOne({ slug: PROJECT_OWNER_ROLE }))!._id.toString());

    await expect(
      updateRole(owner._id.toString(), {
        name: "Renamed Owner",
        description: owner.description,
        permissions: [...owner.permissions],
      }),
    ).rejects.toBeInstanceOf(ValidationError);

    const { role: updated } = await updateRole(owner._id.toString(), {
      name: owner.name,
      description: "Updated owner description.",
      permissions: [projectPermission("dashboard", "view")],
    });

    expect(updated.slug).toBe(PROJECT_OWNER_ROLE);
    expect(updated.description).toBe("Updated owner description.");
    expect(updated.permissions).toEqual([projectPermission("dashboard", "view")]);
  });

  it("reflects a system role permission change live for every project member on that role", async () => {
    await seedSystemRoles();

    const owner = await User.create({
      name: "Owner",
      email: "owner-reflect@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
    });
    const teammate = await User.create({
      name: "Teammate",
      email: "teammate-reflect@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
    });

    const { project } = await createProject(
      authContextFor(owner),
      projectInput({ businessName: "Reflect Project", websiteUrl: "https://reflect.example.com" }),
    );
    await Project.findByIdAndUpdate(project._id, { status: "active" });
    await assignProjectMember({ projectId: project._id, userId: teammate._id, roleSlug: PROJECT_USER_ROLE });

    const beforeAccess = await getProjectAccessForUser(authContextFor(teammate), project._id.toString());
    expect(beforeAccess!.permissions).not.toContain(projectPermission("leads", "create"));

    const projectUserRole = await Role.findOne({ slug: PROJECT_USER_ROLE });
    await updateRole(projectUserRole!._id.toString(), {
      name: projectUserRole!.name,
      description: projectUserRole!.description,
      permissions: [...projectUserRole!.permissions, projectPermission("leads", "create")],
    });

    const afterAccess = await getProjectAccessForUser(authContextFor(teammate), project._id.toString());
    expect(afterAccess!.permissions).toContain(projectPermission("leads", "create"));
  });

  it("rejects unknown permissions on update", async () => {
    const { role } = await createRole({ name: "Coordinator", description: "", permissions: [] });

    await expect(
      updateRole(role._id.toString(), { name: "Coordinator", description: "", permissions: ["bogus.permission"] }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("does not crash on regex metacharacters when renaming a custom role", async () => {
    const { role } = await createRole({ name: "Support Team", description: "", permissions: [] });

    const { role: renamed } = await updateRole(role._id.toString(), {
      name: "Support (Tier 2)",
      description: "",
      permissions: [],
    });

    expect(renamed.name).toBe("Support (Tier 2)");
  });

  it("rejects renaming to a name already used by another role (case-insensitive)", async () => {
    await createRole({ name: "Taken Name", description: "", permissions: [] });
    const { role: other } = await createRole({ name: "Other Role", description: "", permissions: [] });

    await expect(
      updateRole(other._id.toString(), { name: "taken name", description: "", permissions: [] }),
    ).rejects.toBeInstanceOf(ValidationError);
  });
});
