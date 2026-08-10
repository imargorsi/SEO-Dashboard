import { describe, expect, it, vi } from "vitest";

import { hashPassword } from "@/lib/auth/password";
import { createProject } from "@/lib/projects/create-project";
import { approveProject } from "@/lib/projects/project-status-actions";
import { reassignProjectOwner } from "@/lib/projects/reassign-project-owner";
import { resolveProjectOwnerEmail } from "@/lib/projects/send-project-owner-mail";
import { SUPER_ADMIN_ROLE } from "@/lib/rbac/roles";
import { seedSystemRoles } from "@/lib/rbac/seed-roles";
import { User } from "@/models";
import { authContextFor, projectInput } from "@/tests/helpers/project-test-utils";

vi.mock("@/lib/mail/client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/mail/client")>();
  return {
    ...actual,
    sendMail: vi.fn(async () => undefined),
  };
});

describe("resolveProjectOwnerEmail", () => {
  it("uses the current project_owner after reassignment, not createdByUserId", async () => {
    await seedSystemRoles();

    const admin = await User.create({
      name: "Admin",
      email: "admin-owner-mail@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [SUPER_ADMIN_ROLE],
    });

    const creator = await User.create({
      name: "Creator",
      email: "creator-owner-mail@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
    });

    const newOwner = await User.create({
      name: "New Owner",
      email: "new-owner-mail@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
    });

    const { project } = await createProject(
      authContextFor(creator),
      projectInput({
        businessName: "Reassign Mail Co",
        websiteUrl: "https://reassign-mail.example.com",
      }),
    );

    expect(await resolveProjectOwnerEmail(project)).toBe("creator-owner-mail@example.com");

    await reassignProjectOwner(authContextFor(admin), project, newOwner._id.toString());
    await project.save();

    expect(project.createdByUserId.toString()).toBe(creator._id.toString());
    expect(project.pocEmail).toBe("new-owner-mail@example.com");
    expect(await resolveProjectOwnerEmail(project)).toBe("new-owner-mail@example.com");
  });

  it("approves to the reassigned owner mailbox", async () => {
    await seedSystemRoles();

    const { sendMail } = await import("@/lib/mail/client");
    vi.mocked(sendMail).mockClear();

    const admin = await User.create({
      name: "Admin",
      email: "admin-approve-mail@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [SUPER_ADMIN_ROLE],
    });

    const creator = await User.create({
      name: "Creator",
      email: "creator-approve-mail@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
    });

    const newOwner = await User.create({
      name: "New Owner",
      email: "new-approve-mail@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
    });

    const { project } = await createProject(
      authContextFor(creator),
      projectInput({
        businessName: "Approve Mail Co",
        websiteUrl: "https://approve-mail.example.com",
      }),
    );

    await reassignProjectOwner(authContextFor(admin), project, newOwner._id.toString());
    await project.save();

    vi.mocked(sendMail).mockClear();
    await approveProject(authContextFor(admin), project._id.toString());

    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "new-approve-mail@example.com",
        subject: expect.stringContaining("Approved"),
      }),
    );
  });
});
