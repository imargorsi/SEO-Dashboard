import { describe, expect, it } from "vitest";

import { hashPassword } from "@/lib/auth/password";
import { NotFoundError, ValidationError } from "@/lib/api/http-errors";
import { createProject } from "@/lib/projects/create-project";
import { requireProjectPermission } from "@/lib/projects/get-project-access";
import { createSeoActivity } from "@/lib/seo-activities/create-seo-activity";
import { deleteSeoActivity } from "@/lib/seo-activities/delete-seo-activity";
import { listSeoActivities } from "@/lib/seo-activities/list-seo-activities";
import { updateSeoActivity } from "@/lib/seo-activities/update-seo-activity";
import { seedSystemRoles } from "@/lib/rbac/seed-roles";
import { SeoActivity, User } from "@/models";
import { authContextFor, projectInput } from "@/tests/helpers/project-test-utils";

describe("SEO activities CRUD", () => {
  it("creates, lists, updates, and deletes within a project", async () => {
    await seedSystemRoles();

    const owner = await User.create({
      name: "Owner",
      email: "seo-owner@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
    });

    const { project } = await createProject(
      authContextFor(owner),
      projectInput({
        businessName: "SEO Project",
        websiteUrl: "https://seo.example.com",
      }),
    );

    const projectId = project._id.toString();
    const auth = authContextFor(owner);

    const { activity } = await createSeoActivity(auth, projectId, {
      type: "blogs",
      title: "Local SEO Guide",
      url: "https://seo.example.com/blog/local",
      occurredOn: "2026-07-01",
    });

    expect(activity.activityType).toBe("blogs");
    expect(activity.title).toBe("Local SEO Guide");

    const listed = await listSeoActivities(projectId, {
      type: "blogs",
      page: 1,
      per_page: 6,
      from: "2026-07-01",
      to: "2026-07-31",
    });

    expect(listed.items).toHaveLength(1);
    expect(listed.filters.type_counts.blogs).toBe(1);
    expect(listed.items[0]?.id).toBe(activity._id.toString());

    const { activity: updated } = await updateSeoActivity(auth, projectId, activity._id.toString(), {
      title: "Updated Local SEO Guide",
      url: "https://seo.example.com/blog/local-v2",
      occurredOn: "2026-07-02",
    });

    expect(updated.title).toBe("Updated Local SEO Guide");
    expect(updated.occurredOn).toBe("2026-07-02");

    await deleteSeoActivity(projectId, activity._id.toString());
    const remaining = await SeoActivity.countDocuments({ projectId });
    expect(remaining).toBe(0);
  });

  it("rejects cross-project update and delete", async () => {
    await seedSystemRoles();

    const ownerA = await User.create({
      name: "Owner A",
      email: "seo-owner-a@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
    });

    const ownerB = await User.create({
      name: "Owner B",
      email: "seo-owner-b@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
    });

    const { project: projectA } = await createProject(
      authContextFor(ownerA),
      projectInput({
        businessName: "Project A",
        websiteUrl: "https://a.example.com",
      }),
    );

    const { project: projectB } = await createProject(
      authContextFor(ownerB),
      projectInput({
        businessName: "Project B",
        websiteUrl: "https://b.example.com",
      }),
    );

    const { activity } = await createSeoActivity(authContextFor(ownerA), projectA._id.toString(), {
      type: "backlinks",
      anchorText: "Partner Link",
      url: "https://news.example.com/feature",
      occurredOn: "2026-07-10",
    });

    await expect(
      updateSeoActivity(authContextFor(ownerB), projectB._id.toString(), activity._id.toString(), {
        anchorText: "Hijacked",
        url: "https://evil.example.com",
        occurredOn: "2026-07-10",
      }),
    ).rejects.toBeInstanceOf(NotFoundError);

    await expect(
      deleteSeoActivity(projectB._id.toString(), activity._id.toString()),
    ).rejects.toBeInstanceOf(NotFoundError);

    const stillThere = await SeoActivity.findById(activity._id);
    expect(stillThere).not.toBeNull();
  });

  it("requires seo_activities.create for members without permission", async () => {
    await seedSystemRoles();

    const owner = await User.create({
      name: "Owner",
      email: "seo-owner-perm@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
    });

    const outsider = await User.create({
      name: "Outsider",
      email: "seo-outsider@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
    });

    const { project } = await createProject(
      authContextFor(owner),
      projectInput({
        businessName: "Perm Project",
        websiteUrl: "https://perm.example.com",
      }),
    );

    const forbidden = await requireProjectPermission(
      authContextFor(outsider),
      project._id.toString(),
      "seo_activities.create",
    );

    expect(forbidden).toBeInstanceOf(Response);
    expect(forbidden?.status).toBe(403);
  });

  it("validates type-specific fields on create", async () => {
    await seedSystemRoles();

    const owner = await User.create({
      name: "Owner",
      email: "seo-owner-val@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
    });

    const { project } = await createProject(
      authContextFor(owner),
      projectInput({
        businessName: "Validation Project",
        websiteUrl: "https://val.example.com",
      }),
    );

    const { createSeoActivitySchema } = await import("@/schemas/seo-activity");
    const parsed = createSeoActivitySchema.safeParse({
      type: "blogs",
      title: "ab",
      url: "https://val.example.com/x",
      occurredOn: "2026-07-01",
    });

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues.some((issue) => issue.path[0] === "title")).toBe(true);
    }

    // keep ValidationError import used for intent clarity in suite
    expect(ValidationError).toBeDefined();
    expect(project._id).toBeTruthy();
  });
});
