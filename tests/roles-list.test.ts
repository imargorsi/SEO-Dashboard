import { describe, expect, it } from "vitest";

import { hashPassword } from "@/lib/auth/password";
import { seedSystemRoles } from "@/lib/rbac/seed-roles";
import { buildListRolesResponse, listRoles } from "@/lib/roles/list-roles";
import { createRole } from "@/lib/roles/create-role";
import { deactivateRole } from "@/lib/roles/role-status-actions";
import { PROJECT_OWNER_ROLE, PROJECT_USER_ROLE } from "@/lib/rbac/roles";
import { User } from "@/models";
import { authContextFor } from "@/tests/helpers/project-test-utils";

const defaultListQuery = { page: 1, per_page: 15, newest: true } as const;

describe("GET /admin/roles — listRoles", () => {
  it("returns seeded system roles with permission and member counts", async () => {
    await seedSystemRoles();

    const result = await listRoles({ ...defaultListQuery });

    expect(result.items.length).toBeGreaterThanOrEqual(2);
    expect(result.filters.newest).toBe(true);
    expect(result.pagination.total).toBeGreaterThanOrEqual(2);

    const slugs = result.items.map((role) => role.slug);
    expect(slugs).toContain(PROJECT_OWNER_ROLE);
    expect(slugs).toContain(PROJECT_USER_ROLE);

    const owner = result.items.find((role) => role.slug === PROJECT_OWNER_ROLE);
    expect(owner).toMatchObject({
      is_system: true,
      scope: "project",
      permissions_count: expect.any(Number),
      members_count: expect.any(Number),
    });
  });

  it("excludes reserved and deprecated roles from the list", async () => {
    await seedSystemRoles();

    const { Role } = await import("@/models");
    await Role.create({
      slug: "super_admin",
      name: "Super Admin",
      description: "Should never appear",
      scope: "platform",
      isSystem: true,
      permissions: [],
    });
    await Role.create({
      slug: "company_admin",
      name: "Company Admin",
      description: "Deprecated",
      scope: "platform",
      isSystem: false,
      permissions: [],
    });

    const result = await listRoles({ ...defaultListQuery, per_page: 100 });
    const slugs = result.items.map((role) => role.slug);

    expect(slugs).not.toContain("super_admin");
    expect(slugs).not.toContain("company_admin");
    expect(slugs).toContain(PROJECT_OWNER_ROLE);
    expect(slugs).toContain(PROJECT_USER_ROLE);
  });

  it("sorts roles oldest first when newest is false", async () => {
    await seedSystemRoles();

    const result = await listRoles({ ...defaultListQuery, newest: false });
    const timestamps = result.items.map((role) => new Date(role.created_at).getTime());

    for (let index = 1; index < timestamps.length; index += 1) {
      expect(timestamps[index]).toBeGreaterThanOrEqual(timestamps[index - 1]!);
    }
  });

  it("filters roles by status and returns status counts", async () => {
    const admin = authContextFor(
      await User.create({
        name: "Admin",
        email: "roles-list-status-admin@example.com",
        password: await hashPassword("password"),
        emailVerifiedAt: new Date(),
        roles: ["super_admin"],
      })
    );

    const { role: activeRole } = await createRole({
      name: "Roles List Active",
      description: "",
      permissions: [],
    });
    const { role: inactiveRole } = await createRole({
      name: "Roles List Inactive",
      description: "",
      permissions: [],
    });
    await deactivateRole(admin, inactiveRole._id.toString());

    const inactiveOnly = await listRoles({
      ...defaultListQuery,
      search: "Roles List",
      status: "inactive",
    });

    expect(inactiveOnly.items).toHaveLength(1);
    expect(inactiveOnly.items[0]!.slug).toBe(inactiveRole.slug);
    expect(inactiveOnly.filters.status).toBe("inactive");
    expect(inactiveOnly.filters.status_counts).toEqual({
      all: 2,
      active: 1,
      inactive: 1,
    });

    const activeOnly = await listRoles({
      ...defaultListQuery,
      search: "Roles List",
      status: "active",
    });

    expect(activeOnly.items).toHaveLength(1);
    expect(activeOnly.items[0]!.slug).toBe(activeRole.slug);
  });

  it("serializes list response envelope", async () => {
    const response = buildListRolesResponse({
      items: [],
      pagination: {
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 0,
        from: null,
        to: null,
        has_more_pages: false,
        links: { first: null, last: null, prev: null, next: null },
      },
      filters: {
        search: null,
        newest: true,
      },
    });

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.items).toEqual([]);
  });
});
