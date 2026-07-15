import { describe, expect, it } from "vitest";

import { ValidationError } from "@/lib/api/http-errors";
import { createRole } from "@/lib/roles/create-role";
import { projectPermission } from "@/lib/rbac/permission-catalog";
import { seedSystemRoles } from "@/lib/rbac/seed-roles";
import { PROJECT_OWNER_ROLE } from "@/lib/rbac/roles";
import { Role } from "@/models";

describe("POST /admin/roles — createRole", () => {
  it("creates a project-scoped custom role with a generated slug", async () => {
    const { role } = await createRole({
      name: "Content Manager",
      description: "Manages SEO content.",
      permissions: [projectPermission("seo_activities", "view"), projectPermission("seo_activities", "update")],
    });

    expect(role.slug).toBe("content_manager");
    expect(role.scope).toBe("project");
    expect(role.isSystem).toBe(false);
    expect(role.permissions).toEqual(
      expect.arrayContaining([projectPermission("seo_activities", "view"), projectPermission("seo_activities", "update")]),
    );
  });

  it("de-duplicates a colliding slug generated from the name", async () => {
    const first = await createRole({ name: "Analyst", description: "", permissions: [] });
    const second = await createRole({ name: "Analyst!!", description: "", permissions: [] });

    expect(first.role.slug).toBe("analyst");
    expect(second.role.slug).not.toBe(first.role.slug);
  });

  it("rejects a duplicate role name", async () => {
    await createRole({ name: "Editor", description: "", permissions: [] });

    await expect(createRole({ name: "editor", description: "", permissions: [] })).rejects.toBeInstanceOf(
      ValidationError,
    );
  });

  it("rejects unknown permissions", async () => {
    await expect(
      createRole({ name: "Bad Perms", description: "", permissions: ["not.a.permission"] }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("rejects admin permissions on a project-scoped role", async () => {
    await expect(
      createRole({ name: "Admin Wannabe", description: "", permissions: ["admin.roles.view"] }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("rejects reusing a reserved role name", async () => {
    await seedSystemRoles();

    await expect(
      createRole({ name: "super_admin", description: "", permissions: [] }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("never overwrites the seeded project_owner slug", async () => {
    await seedSystemRoles();

    const { role } = await createRole({ name: "Project Owner Copy", description: "", permissions: [] });
    expect(role.slug).not.toBe(PROJECT_OWNER_ROLE);

    const owner = await Role.findOne({ slug: PROJECT_OWNER_ROLE });
    expect(owner).not.toBeNull();
  });

  it("does not crash or false-match on regex metacharacters in the name", async () => {
    const { role } = await createRole({ name: "C++ Team", description: "", permissions: [] });
    expect(role.name).toBe("C++ Team");

    // "C Team" must not be treated as a duplicate of "C++ Team" just because an unescaped
    // regex would (incorrectly) match "C" followed by anything.
    const { role: unrelated } = await createRole({ name: "C Team", description: "", permissions: [] });
    expect(unrelated.id).not.toBe(role.id);
  });

  it("rejects a name that normalizes to a reserved slug, before it ever reaches slug generation", async () => {
    await expect(
      createRole({ name: "Super.Admin", description: "", permissions: [] }),
    ).rejects.toBeInstanceOf(ValidationError);

    const leaked = await Role.findOne({ slug: "super_admin" });
    expect(leaked).toBeNull();
  });

  it("enforces case-insensitive name uniqueness at the database level", async () => {
    await Role.create({
      slug: "db-level-test-1",
      name: "Db Level Test",
      description: "",
      scope: "project",
      isSystem: false,
      permissions: [],
    });

    await expect(
      Role.create({
        slug: "db-level-test-2",
        name: "db level test",
        description: "",
        scope: "project",
        isSystem: false,
        permissions: [],
      }),
    ).rejects.toThrow();
  });
});
