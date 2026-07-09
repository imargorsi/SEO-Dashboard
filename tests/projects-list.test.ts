import { describe, expect, it } from "vitest";

import { hashPassword } from "@/lib/auth/password";
import type { AuthContext } from "@/lib/auth/guards";
import { createProject } from "@/lib/projects/create-project";
import { buildListProjectsResponse, listProjects } from "@/lib/projects/list-projects";
import { assignProjectMember } from "@/lib/projects/assign-member";
import { PROJECT_USER_ROLE, SUPER_ADMIN_ROLE } from "@/lib/rbac/roles";
import { seedSystemRoles } from "@/lib/rbac/seed-roles";
import { Project, User } from "@/models";

function authContextFor(user: Awaited<ReturnType<typeof User.create>>): AuthContext {
  return {
    user,
    token: "test-token",
    tokenId: user._id,
  };
}

describe("GET /projects — listProjects", () => {
  it("returns only projects the user belongs to", async () => {
    await seedSystemRoles();

    const user = await User.create({
      name: "Member",
      email: "member@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
    });

    const other = await User.create({
      name: "Other",
      email: "other@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
    });

    const mine = await createProject(authContextFor(user), {
      businessName: "My Project",
      websiteUrl: "https://mine.example.com",
      servicesOffered: [],
      targetLocations: [],
      competitorUrls: [],
    });

    await createProject(authContextFor(other), {
      businessName: "Other Project",
      websiteUrl: "https://other.example.com",
      servicesOffered: [],
      targetLocations: [],
      competitorUrls: [],
    });

    const projects = await listProjects(authContextFor(user));

    expect(projects).toHaveLength(1);
    expect(projects[0]!.id).toBe(mine.project._id.toString());
  });

  it("returns all projects for super_admin", async () => {
    await seedSystemRoles();

    const admin = await User.create({
      name: "Admin",
      email: "admin@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [SUPER_ADMIN_ROLE],
    });

    const user = await User.create({
      name: "User",
      email: "user@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
    });

    await createProject(authContextFor(user), {
      businessName: "User Project",
      websiteUrl: "https://user.example.com",
      servicesOffered: [],
      targetLocations: [],
      competitorUrls: [],
    });

    await createProject(authContextFor(admin), {
      businessName: "Admin Project",
      websiteUrl: "https://admin.example.com",
      ownerUserId: user._id.toString(),
      servicesOffered: [],
      targetLocations: [],
      competitorUrls: [],
    });

    const projects = await listProjects(authContextFor(admin));

    expect(projects).toHaveLength(2);
    expect(projects.map((project) => project.businessName).sort()).toEqual([
      "Admin Project",
      "User Project",
    ]);
  });

  it("excludes projects where membership is not active", async () => {
    await seedSystemRoles();

    const user = await User.create({
      name: "Removed",
      email: "removed@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
    });

    const owner = await User.create({
      name: "Owner",
      email: "owner@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
    });

    const { project } = await createProject(authContextFor(owner), {
      businessName: "Shared Project",
      websiteUrl: "https://shared.example.com",
      servicesOffered: [],
      targetLocations: [],
      competitorUrls: [],
    });

    await assignProjectMember({
      projectId: project._id,
      userId: user._id,
      roleSlug: PROJECT_USER_ROLE,
      status: "removed",
    });

    const projects = await listProjects(authContextFor(user));
    expect(projects).toHaveLength(0);
  });

  it("returns list items in camelCase API shape", async () => {
    await seedSystemRoles();

    const user = await User.create({
      name: "Lister",
      email: "lister@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
    });

    await createProject(authContextFor(user), {
      businessName: "List Co",
      websiteUrl: "https://list.example.com",
      servicesOffered: [],
      targetLocations: [],
      competitorUrls: [],
    });

    const projects = await listProjects(authContextFor(user));
    const response = buildListProjectsResponse(projects);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.items).toHaveLength(1);
    expect(body.data.items[0]).toEqual({
      id: projects[0]!.id,
      businessName: "List Co",
      websiteUrl: "https://list.example.com",
      status: "pending",
      imageUrl: null,
      owner: {
        id: user._id.toString(),
        name: "Lister",
        profileImage: null,
      },
    });
  });

  it("returns null for legacy local profile image paths", async () => {
    await seedSystemRoles();

    const user = await User.create({
      name: "Photo Owner",
      email: "photo-owner@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
      profileImage: "profile-images/abc/avatar.jpg",
    });

    await createProject(authContextFor(user), {
      businessName: "Photo Co",
      websiteUrl: "https://photo.example.com",
      servicesOffered: [],
      targetLocations: [],
      competitorUrls: [],
    });

    const projects = await listProjects(authContextFor(user));

    expect(projects).toHaveLength(1);
    expect(projects[0]!.owner?.profileImage).toBeNull();
  });

  it("serializes owner profile image as a signed URL for blob storage", async () => {
    await seedSystemRoles();

    const user = await User.create({
      name: "Blob Owner",
      email: "blob-owner@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
      profileImage: "blob:profile-images/abc/avatar.jpg",
    });

    await createProject(authContextFor(user), {
      businessName: "Blob Co",
      websiteUrl: "https://blob.example.com",
      servicesOffered: [],
      targetLocations: [],
      competitorUrls: [],
    });

    const projects = await listProjects(authContextFor(user));

    expect(projects).toHaveLength(1);
    expect(projects[0]!.owner?.profileImage).toContain("/api/v1/storage/image?pathname=");
    expect(projects[0]!.owner?.profileImage).toContain("signature=");
  });

  it("returns an empty list when the user has no projects", async () => {
    const user = await User.create({
      name: "Empty",
      email: "empty@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
    });

    const projects = await listProjects(authContextFor(user));
    expect(projects).toEqual([]);
  });
});
