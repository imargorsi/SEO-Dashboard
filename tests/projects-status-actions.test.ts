import { describe, expect, it } from "vitest";

import { hashPassword } from "@/lib/auth/password";
import { ValidationError } from "@/lib/api/http-errors";
import { createProject } from "@/lib/projects/create-project";
import {
  activateProject,
  approveProject,
  deactivateProject,
  rejectProject,
} from "@/lib/projects/project-status-actions";
import { SUPER_ADMIN_ROLE } from "@/lib/rbac/roles";
import { seedSystemRoles } from "@/lib/rbac/seed-roles";
import { Project, User } from "@/models";
import { authContextFor, projectInput } from "@/tests/helpers/project-test-utils";

describe("Project status actions — admin transitions", () => {
  it("approves a pending project", async () => {
    await seedSystemRoles();

    const admin = await User.create({
      name: "Admin",
      email: "admin-approve@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [SUPER_ADMIN_ROLE],
    });

    const creator = await User.create({
      name: "Creator",
      email: "creator-approve@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
    });

    const { project } = await createProject(
      authContextFor(creator),
      projectInput({
        businessName: "Pending Co",
        websiteUrl: "https://pending.example.com",
      }),
    );

    const approved = await approveProject(authContextFor(admin), project._id.toString());

    expect(approved.status).toBe("active");
    expect(approved.approvedByUserId?.toString()).toBe(admin._id.toString());
    expect(approved.approvedAt).not.toBeNull();
    expect(approved.rejectedAt).toBeNull();
  });

  it("rejects a pending project", async () => {
    await seedSystemRoles();

    const admin = await User.create({
      name: "Admin",
      email: "admin-reject@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [SUPER_ADMIN_ROLE],
    });

    const creator = await User.create({
      name: "Creator",
      email: "creator-reject@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
    });

    const { project } = await createProject(
      authContextFor(creator),
      projectInput({
        businessName: "Reject Co",
        websiteUrl: "https://reject.example.com",
      }),
    );

    const rejected = await rejectProject(authContextFor(admin), project._id.toString());

    expect(rejected.status).toBe("rejected");
    expect(rejected.rejectedByUserId?.toString()).toBe(admin._id.toString());
    expect(rejected.rejectedAt).not.toBeNull();
  });

  it("deactivates an active project", async () => {
    await seedSystemRoles();

    const admin = await User.create({
      name: "Admin",
      email: "admin-deactivate@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [SUPER_ADMIN_ROLE],
    });

    const { project } = await createProject(
      authContextFor(admin),
      projectInput({
        businessName: "Active Co",
        websiteUrl: "https://active.example.com",
      }),
    );

    const deactivated = await deactivateProject(authContextFor(admin), project._id.toString());
    expect(deactivated.status).toBe("inactive");
  });

  it("activates an inactive project", async () => {
    await seedSystemRoles();

    const admin = await User.create({
      name: "Admin",
      email: "admin-activate@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [SUPER_ADMIN_ROLE],
    });

    const { project } = await createProject(
      authContextFor(admin),
      projectInput({
        businessName: "Inactive Co",
        websiteUrl: "https://inactive.example.com",
      }),
    );

    await Project.findByIdAndUpdate(project._id, { status: "inactive" });

    const activated = await activateProject(authContextFor(admin), project._id.toString());
    expect(activated.status).toBe("active");
  });

  it("blocks invalid transitions", async () => {
    await seedSystemRoles();

    const admin = await User.create({
      name: "Admin",
      email: "admin-invalid@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [SUPER_ADMIN_ROLE],
    });

    const creator = await User.create({
      name: "Creator",
      email: "creator-invalid@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
    });

    const { project } = await createProject(
      authContextFor(creator),
      projectInput({
        businessName: "Invalid Co",
        websiteUrl: "https://invalid.example.com",
      }),
    );

    const projectId = project._id.toString();
    const adminAuth = authContextFor(admin);

    await expect(approveProject(adminAuth, projectId)).resolves.toMatchObject({
      status: "active",
    });

    await expect(rejectProject(adminAuth, projectId)).rejects.toBeInstanceOf(ValidationError);

    await expect(deactivateProject(adminAuth, projectId)).resolves.toMatchObject({
      status: "inactive",
    });

    await expect(approveProject(adminAuth, projectId)).rejects.toBeInstanceOf(ValidationError);
    await expect(activateProject(adminAuth, projectId)).resolves.toMatchObject({
      status: "active",
    });
    await expect(deactivateProject(adminAuth, projectId)).resolves.toMatchObject({
      status: "inactive",
    });
  });
});
