import { describe, expect, it, vi } from "vitest";

import { hashPassword } from "@/lib/auth/password";
import { createProject } from "@/lib/projects/create-project";
import { parseUpdateProjectRequest } from "@/lib/projects/parse-update-project-request";
import { buildUpdateProjectResponse, updateProject } from "@/lib/projects/update-project";
import { SUPER_ADMIN_ROLE } from "@/lib/rbac/roles";
import { seedSystemRoles } from "@/lib/rbac/seed-roles";
import { Project, User } from "@/models";
import { authContextFor, projectInput } from "@/tests/helpers/project-test-utils";

vi.mock("@/lib/projects/project-logo-storage", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/projects/project-logo-storage")>();
  return {
    ...actual,
    deleteStoredProjectLogo: vi.fn().mockResolvedValue(undefined),
  };
});

import { deleteStoredProjectLogo } from "@/lib/projects/project-logo-storage";

describe("PATCH /projects/{id} — updateProject", () => {
  it("applies partial field updates for a project member", async () => {
    await seedSystemRoles();

    const user = await User.create({
      name: "Editor",
      email: "editor-update@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
    });

    const { project } = await createProject(
      authContextFor(user),
      projectInput({
        businessName: "Original Name",
        websiteUrl: "https://original.example.com",
        businessAddress: "123 Main St",
        servicesOffered: ["SEO"],
      }),
    );

    const { project: updated } = await updateProject(
      authContextFor(user),
      project._id.toString(),
      { websiteUrl: "https://updated.example.com" },
      new Set(["websiteUrl"]),
    );

    expect(updated.websiteUrl).toBe("https://updated.example.com");
    expect(updated.businessName).toBe("Original Name");
    expect(updated.businessAddress).toBe("123 Main St");
    expect(updated.servicesOffered).toEqual(["SEO"]);
  });

  it("clears nullable text fields when null is sent", async () => {
    await seedSystemRoles();

    const user = await User.create({
      name: "Editor",
      email: "clear-fields@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
    });

    const { project } = await createProject(
      authContextFor(user),
      projectInput({
        businessName: "Clear Fields Co",
        websiteUrl: "https://clear.example.com",
        businessAddress: "123 Main St",
        primaryServiceToPromote: "SEO",
      }),
    );

    const { project: updated } = await updateProject(
      authContextFor(user),
      project._id.toString(),
      {
        businessAddress: null,
        primaryServiceToPromote: null,
      },
      new Set(["businessAddress", "primaryServiceToPromote"]),
    );

    expect(updated.businessAddress).toBeNull();
    expect(updated.primaryServiceToPromote).toBeNull();
  });

  it("clears list fields when null is sent", async () => {
    await seedSystemRoles();

    const user = await User.create({
      name: "Editor",
      email: "clear-lists@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
    });

    const { project } = await createProject(
      authContextFor(user),
      projectInput({
        businessName: "List Clear Co",
        websiteUrl: "https://lists.example.com",
        servicesOffered: ["SEO", "PPC"],
        targetLocations: ["NYC"],
        competitorUrls: ["https://competitor.example.com"],
        seoGoals: ["get_more_calls"],
      }),
    );

    const { project: updated } = await updateProject(
      authContextFor(user),
      project._id.toString(),
      {
        servicesOffered: null,
        targetLocations: null,
        competitorUrls: null,
        seoGoals: null,
      },
      new Set(["servicesOffered", "targetLocations", "competitorUrls", "seoGoals"]),
    );

    expect(updated.servicesOffered).toEqual([]);
    expect(updated.targetLocations).toEqual([]);
    expect(updated.competitorUrls).toEqual([]);
    expect(updated.seoGoals).toEqual([]);
  });

  it("allows updates on inactive projects", async () => {
    await seedSystemRoles();

    const user = await User.create({
      name: "Editor",
      email: "inactive-update@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
    });

    const { project } = await createProject(
      authContextFor(user),
      projectInput({
        businessName: "Inactive Co",
        websiteUrl: "https://inactive.example.com",
      }),
    );

    await Project.findByIdAndUpdate(project._id, { status: "inactive" });

    const { project: updated } = await updateProject(
      authContextFor(user),
      project._id.toString(),
      { websiteUrl: "https://inactive-updated.example.com" },
      new Set(["websiteUrl"]),
    );

    expect(updated.status).toBe("inactive");
    expect(updated.websiteUrl).toBe("https://inactive-updated.example.com");
  });

  it("rejects updates on rejected projects", async () => {
    await seedSystemRoles();

    const user = await User.create({
      name: "Editor",
      email: "rejected-update@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
    });

    const { project } = await createProject(
      authContextFor(user),
      projectInput({
        businessName: "Rejected Co",
        websiteUrl: "https://rejected.example.com",
      }),
    );

    await Project.findByIdAndUpdate(project._id, { status: "rejected" });

    await expect(
      updateProject(
        authContextFor(user),
        project._id.toString(),
        { websiteUrl: "https://should-not-update.example.com" },
        new Set(["websiteUrl"]),
      ),
    ).rejects.toMatchObject({
      statusCode: 422,
      errors: { status: ["Rejected Projects Cannot Be Edited."] },
    });
  });

  it("returns 404 when the user cannot access the project", async () => {
    await seedSystemRoles();

    const owner = await User.create({
      name: "Owner",
      email: "owner-update@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
    });

    const other = await User.create({
      name: "Other",
      email: "other-update@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
    });

    const { project } = await createProject(
      authContextFor(owner),
      projectInput({
        businessName: "Private Co",
        websiteUrl: "https://private.example.com",
      }),
    );

    await expect(
      updateProject(
        authContextFor(other),
        project._id.toString(),
        { websiteUrl: "https://blocked.example.com" },
        new Set(["websiteUrl"]),
      ),
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it("allows super_admin to update any project", async () => {
    await seedSystemRoles();

    const owner = await User.create({
      name: "Owner",
      email: "owner-admin-update@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
    });

    const admin = await User.create({
      name: "Admin",
      email: "admin-update@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [SUPER_ADMIN_ROLE],
    });

    const { project } = await createProject(
      authContextFor(owner),
      projectInput({
        businessName: "Admin Update Co",
        websiteUrl: "https://admin-update.example.com",
      }),
    );

    const { project: updated } = await updateProject(
      authContextFor(admin),
      project._id.toString(),
      { websiteUrl: "https://admin-updated.example.com" },
      new Set(["websiteUrl"]),
    );

    expect(updated.websiteUrl).toBe("https://admin-updated.example.com");
  });

  it("replaces the logo and deletes the previous blob", async () => {
    await seedSystemRoles();
    vi.mocked(deleteStoredProjectLogo).mockClear();

    const user = await User.create({
      name: "Editor",
      email: "logo-update@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
    });

    const { project } = await createProject(
      authContextFor(user),
      projectInput({
        businessName: "Logo Co",
        websiteUrl: "https://logo.example.com",
      }),
    );

    await Project.findByIdAndUpdate(project._id, {
      logoImage: "blob:project-logos/user/old-logo.png",
    });

    const { project: updated } = await updateProject(
      authContextFor(user),
      project._id.toString(),
      {},
      new Set<string>(),
      { logoImage: "blob:project-logos/user/new-logo.png" },
    );

    expect(updated.logoImage).toBe("blob:project-logos/user/new-logo.png");
    expect(deleteStoredProjectLogo).toHaveBeenCalledWith("blob:project-logos/user/old-logo.png");
  });

  it("returns a serialized project response", async () => {
    await seedSystemRoles();

    const user = await User.create({
      name: "Editor",
      email: "response-update@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
    });

    const { project } = await createProject(
      authContextFor(user),
      projectInput({
        businessName: "Response Co",
        websiteUrl: "https://response-update.example.com",
      }),
    );

    const { project: updated } = await updateProject(
      authContextFor(user),
      project._id.toString(),
      { websiteUrl: "https://response-updated.example.com" },
      new Set(["websiteUrl"]),
    );

    const response = await buildUpdateProjectResponse(updated);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.message).toBe("Project Updated Successfully.");
    expect(body.data.websiteUrl).toBe("https://response-updated.example.com");
    expect(body.data.businessName).toBe("Response Co");
  });

  it("rejects locked fields in the request parser", async () => {
    await expect(
      parseUpdateProjectRequest(
        new Request("http://localhost/api/v1/projects/1", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ businessName: "New Name" }),
        }),
      ),
    ).rejects.toMatchObject({
      errors: { businessName: ["Business Name Cannot Be Changed."] },
    });

    await expect(
      parseUpdateProjectRequest(
        new Request("http://localhost/api/v1/projects/1", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pocEmail: "new@example.com" }),
        }),
      ),
    ).rejects.toMatchObject({
      errors: { pocEmail: ["Contact Email Cannot Be Changed."] },
    });

    await expect(
      parseUpdateProjectRequest(
        new Request("http://localhost/api/v1/projects/1", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ownerUserId: "507f1f77bcf86cd799439011" }),
        }),
      ),
    ).rejects.toMatchObject({
      errors: { ownerUserId: ["Project Owner Cannot Be Changed."] },
    });
  });
});
