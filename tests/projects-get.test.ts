import { describe, expect, it } from "vitest";

import { hashPassword } from "@/lib/auth/password";
import { createProject } from "@/lib/projects/create-project";
import { buildGetProjectResponse, getProjectDetailForUser, getProjectForUser } from "@/lib/projects/get-project";
import { serializeProject } from "@/lib/serializers/project";
import { SUPER_ADMIN_ROLE } from "@/lib/rbac/roles";
import { seedSystemRoles } from "@/lib/rbac/seed-roles";
import { Project, User } from "@/models";
import { authContextFor, projectInput } from "@/tests/helpers/project-test-utils";

describe("GET /projects/{id} — getProjectForUser", () => {
  it("returns a project when the user has active membership", async () => {
    await seedSystemRoles();

    const user = await User.create({
      name: "Member",
      email: "member-get@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
    });

    const { project } = await createProject(
      authContextFor(user),
      projectInput({
        businessName: "My Project",
        websiteUrl: "https://mine.example.com",
      }),
    );

    const found = await getProjectForUser(authContextFor(user), project._id.toString());

    expect(found).not.toBeNull();
    expect(found!._id.toString()).toBe(project._id.toString());
    expect(found!.businessName).toBe("My Project");
  });

  it("returns null when the user is not a member", async () => {
    await seedSystemRoles();

    const owner = await User.create({
      name: "Owner",
      email: "owner-get@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
    });

    const other = await User.create({
      name: "Other",
      email: "other-get@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
    });

    const { project } = await createProject(
      authContextFor(owner),
      projectInput({
        businessName: "Owner Project",
        websiteUrl: "https://owner.example.com",
      }),
    );

    const found = await getProjectForUser(authContextFor(other), project._id.toString());
    expect(found).toBeNull();
  });

  it("returns any project for super_admin", async () => {
    await seedSystemRoles();

    const owner = await User.create({
      name: "Owner",
      email: "owner-admin-get@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
    });

    const admin = await User.create({
      name: "Admin",
      email: "admin-get@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [SUPER_ADMIN_ROLE],
    });

    const { project } = await createProject(
      authContextFor(owner),
      projectInput({
        businessName: "Admin Visible Project",
        websiteUrl: "https://admin-visible.example.com",
      }),
    );

    const found = await getProjectForUser(authContextFor(admin), project._id.toString());

    expect(found).not.toBeNull();
    expect(found!.businessName).toBe("Admin Visible Project");
  });

  it("returns null for an invalid project id", async () => {
    await seedSystemRoles();

    const user = await User.create({
      name: "Member",
      email: "invalid-id@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
    });

    const found = await getProjectForUser(authContextFor(user), "not-a-valid-id");
    expect(found).toBeNull();
  });

  it("includes the project owner on detail responses", async () => {
    await seedSystemRoles();

    const user = await User.create({
      name: "Owner Detail",
      email: "owner-detail@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
    });

    const { project } = await createProject(
      authContextFor(user),
      projectInput({
        businessName: "Owned Detail Project",
        websiteUrl: "https://owned-detail.example.com",
      }),
    );

    const detail = await getProjectDetailForUser(authContextFor(user), project._id.toString());

    expect(detail).not.toBeNull();
    expect(detail!.owner).toMatchObject({
      id: user._id.toString(),
      name: "Owner Detail",
    });
    expect(detail!.createdByUserId).toBe(user._id.toString());
  });

  it("serializes the full project shape", async () => {
    await seedSystemRoles();

    const user = await User.create({
      name: "Member",
      email: "serialize-get@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
    });

    const { project } = await createProject(
      authContextFor(user),
      projectInput({
        businessName: "Serialized Project",
        websiteUrl: "https://serialized.example.com",
        servicesOffered: ["SEO"],
        targetLocations: ["NYC"],
        competitorUrls: ["https://competitor.example.com"],
        seoGoals: ["get_more_calls"],
      }),
    );

    await Project.findByIdAndUpdate(project._id, {
      logoImage: "blob:project-logos/user/logo.png",
    });

    const fresh = await Project.findById(project._id);
    expect(fresh).not.toBeNull();

    const response = buildGetProjectResponse(serializeProject(fresh!));
    const body = await response.json();

    expect(body.success).toBe(true);
    expect(body.data).toMatchObject({
      id: project._id.toString(),
      businessName: "Serialized Project",
      websiteUrl: "https://serialized.example.com",
      servicesOffered: ["SEO"],
      targetLocations: ["NYC"],
      competitorUrls: ["https://competitor.example.com"],
      seoGoals: ["get_more_calls"],
      status: "pending",
    });
    expect(body.data.logoImage).toContain("/api/v1/storage/image");
    expect(body.data.owner).toBeNull();
    expect(body.data.logoImage).toContain("pathname=");
    expect(body.data.logoImage).toContain("signature=");
  });
});
