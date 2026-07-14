import { describe, expect, it } from "vitest";

import { hashPassword } from "@/lib/auth/password";
import { createProject } from "@/lib/projects/create-project";
import { PROJECT_OWNER_ROLE, SUPER_ADMIN_ROLE } from "@/lib/rbac/roles";
import { seedSystemRoles } from "@/lib/rbac/seed-roles";
import { buildListUsersResponse, listUsers } from "@/lib/users/list-users";
import { User } from "@/models";
import { authContextFor, projectInput } from "@/tests/helpers/project-test-utils";

const defaultListQuery = { page: 1, per_page: 15, newest: true } as const;

describe("GET /users — listUsers", () => {
  it("returns users sorted by newest first with pagination", async () => {
    await User.create({
      name: "Older User",
      email: "older@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
    });

    await User.create({
      name: "Newer User",
      email: "newer@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: null,
      roles: [],
    });

    const result = await listUsers({ ...defaultListQuery });

    expect(result.items.length).toBeGreaterThanOrEqual(2);
    expect(result.items[0]!.email).toBe("newer@example.com");
    expect(result.pagination.total).toBeGreaterThanOrEqual(2);
    expect(result.pagination.current_page).toBe(1);
    expect(result.filters.search).toBeNull();
    expect(result.filters.newest).toBe(true);
  });

  it("excludes super_admin users from the list", async () => {
    await User.create({
      name: "Super Admin",
      email: "superadmin-hidden@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [SUPER_ADMIN_ROLE],
    });

    const result = await listUsers({ ...defaultListQuery, search: "superadmin-hidden@" });

    expect(result.items).toHaveLength(0);
    expect(result.pagination.total).toBe(0);
  });

  it("includes assigned projects with membership role and project status", async () => {
    await seedSystemRoles();

    const owner = await User.create({
      name: "Project Owner",
      email: "project-owner@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
    });

    await createProject(
      authContextFor(owner),
      projectInput({ businessName: "Owner Project", websiteUrl: "https://owner.example.com" }),
    );

    const result = await listUsers({ ...defaultListQuery, search: "project-owner@" });
    const item = result.items.find((user) => user.email === "project-owner@example.com");

    expect(item).toBeDefined();
    expect(item!.projects).toEqual([
      expect.objectContaining({
        name: "Owner Project",
        membership_role: PROJECT_OWNER_ROLE,
        membership_status: "active",
        status: "pending",
      }),
    ]);
  });

  it("does not expose password in list items", async () => {
    await User.create({
      name: "Secret User",
      email: "secret@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
    });

    const result = await listUsers({ ...defaultListQuery });
    const item = result.items.find((user) => user.email === "secret@example.com");

    expect(item).toBeDefined();
    expect(item).toMatchObject({
      name: "Secret User",
      email: "secret@example.com",
      profile_image: null,
      status: "active",
      projects: [],
    });
    expect(item).not.toHaveProperty("password");
    expect(item).not.toHaveProperty("roles");
  });

  it("filters users by search on name or email", async () => {
    await User.create({
      name: "Find Me",
      email: "findme@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
    });

    await User.create({
      name: "Hidden User",
      email: "hidden@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
    });

    const byName = await listUsers({ ...defaultListQuery, search: "Find Me" });
    expect(byName.items).toHaveLength(1);
    expect(byName.items[0]!.email).toBe("findme@example.com");

    const byEmail = await listUsers({ ...defaultListQuery, search: "findme@" });
    expect(byEmail.items).toHaveLength(1);
    expect(byEmail.items[0]!.name).toBe("Find Me");
  });

  it("filters users by account status and returns status counts", async () => {
    await User.create({
      name: "Active Listed",
      email: "active-listed@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
      status: "active",
    });

    await User.create({
      name: "Inactive Listed",
      email: "inactive-listed@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
      status: "inactive",
    });

    const inactiveOnly = await listUsers({
      ...defaultListQuery,
      search: "listed@",
      status: "inactive",
    });

    expect(inactiveOnly.items).toHaveLength(1);
    expect(inactiveOnly.items[0]!.email).toBe("inactive-listed@example.com");
    expect(inactiveOnly.filters.status).toBe("inactive");
    expect(inactiveOnly.filters.status_counts).toEqual({
      all: 2,
      active: 1,
      inactive: 1,
    });

    const activeOnly = await listUsers({
      ...defaultListQuery,
      search: "listed@",
      status: "active",
    });

    expect(activeOnly.items).toHaveLength(1);
    expect(activeOnly.items[0]!.email).toBe("active-listed@example.com");
  });

  it("paginates results", async () => {
    for (let index = 0; index < 3; index += 1) {
      await User.create({
        name: `Paged User ${index}`,
        email: `paged-${index}@example.com`,
        password: await hashPassword("password"),
        emailVerifiedAt: new Date(),
        roles: [],
      });
    }

    const pageOne = await listUsers({ ...defaultListQuery, per_page: 2 });
    const pageTwo = await listUsers({ ...defaultListQuery, page: 2, per_page: 2 });

    expect(pageOne.items).toHaveLength(2);
    expect(pageOne.pagination.per_page).toBe(2);
    expect(pageOne.pagination.has_more_pages).toBe(true);
    expect(pageTwo.items.length).toBeGreaterThanOrEqual(1);
  });

  it("serializes list response envelope", async () => {
    const response = buildListUsersResponse({
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
        status: null,
        status_counts: { all: 0, active: 0, inactive: 0 },
      },
    });

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.items).toEqual([]);
  });
});
