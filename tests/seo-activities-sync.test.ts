import { beforeEach, describe, expect, it, vi } from "vitest";

import { createProject } from "@/lib/projects/create-project";
import { listProjectSeoActivities } from "@/lib/seo-activities/list-seo-activities";
import { syncSeoActivities } from "@/lib/seo-activities/sync-seo-activities";
import { seedSystemRoles } from "@/lib/rbac/seed-roles";
import { SUPER_ADMIN_ROLE } from "@/lib/rbac/roles";
import { Project, SeoActivity, User } from "@/models";
import { authContextFor, projectInput } from "@/tests/helpers/project-test-utils";

function csvResponse(body: string): Response {
  return new Response(body, {
    status: 200,
    headers: { "Content-Type": "text/csv" },
  });
}

describe("SEO Activities sync + list", () => {
  beforeEach(async () => {
    await seedSystemRoles();
    vi.restoreAllMocks();
  });

  it("syncs public CSV rows into Mongo and filters list by project business name", async () => {
    const admin = await User.create({
      name: "Admin",
      email: "seo-admin@example.com",
      password: "password123",
      roles: [SUPER_ADMIN_ROLE],
      emailVerifiedAt: new Date(),
    });

    const owner = await User.create({
      name: "Owner",
      email: "seo-owner@example.com",
      password: "password123",
      emailVerifiedAt: new Date(),
    });

    const auth = authContextFor(admin);

    const { project: mtc } = await createProject(
      auth,
      projectInput({
        businessName: "MTC",
        websiteUrl: "https://multitech.sa",
        ownerUserId: owner._id.toString(),
      }),
    );

    const { project: pets } = await createProject(
      auth,
      projectInput({
        businessName: "Pets",
        websiteUrl: "https://pets.example.com",
        ownerUserId: owner._id.toString(),
      }),
    );

    await Project.updateOne({ _id: mtc._id }, { $set: { status: "active" } });
    await Project.updateOne({ _id: pets._id }, { $set: { status: "active" } });

    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.includes("sheet=Blog")) {
          return csvResponse(
            `"Days","Site","Title","Blog Link","Publication Date"\n` +
              `"Monday","MTC","MTC Post","https://example.com/mtc","02-Jun-2026"\n` +
              `"Tuesday","Pets","Pets Post","https://example.com/pets","03-Jun-2026"\n` +
              `"Wednesday","Unknown","Skip","https://example.com/x","04-Jun-2026"\n`,
          );
        }
        if (url.includes("sheet=GP")) {
          return csvResponse(
            `"Days","site","BackLinks","Anchor text","Publication Date"\n` +
              `"Monday","MTC","https://example.com/bl","Anchor","02-Jun-2026"\n`,
          );
        }
        if (url.includes("sheet=Service")) {
          return csvResponse(
            `"Days","Site","Page Link","Details","Change Date"\n` +
              `"Monday","MTC","https://example.com/page","Fix H1","02-Jun-2026"\n`,
          );
        }
        return new Response("not found", { status: 404 });
      }),
    );

    const syncResult = await syncSeoActivities(admin._id.toString());
    expect(syncResult.totals.imported).toBe(4);
    expect(syncResult.totals.skipped).toBe(1);

    const all = await SeoActivity.find({}).lean();
    expect(all).toHaveLength(4);

    const mtcBlogs = await listProjectSeoActivities(mtc._id.toString(), {
      type: "blogs",
      page: 1,
      per_page: 6,
    });
    expect(mtcBlogs.items).toHaveLength(1);
    expect(mtcBlogs.items[0]).toMatchObject({
      site: "MTC",
      title: "MTC Post",
    });
    expect(mtcBlogs.counts).toEqual({
      blogs: 1,
      backlinks: 1,
      web_changes: 1,
    });

    const petsBlogs = await listProjectSeoActivities(pets._id.toString(), {
      type: "blogs",
      page: 1,
      per_page: 6,
    });
    expect(petsBlogs.items).toHaveLength(1);
    expect(petsBlogs.items[0]).toMatchObject({
      site: "Pets",
      title: "Pets Post",
    });
  });
});
