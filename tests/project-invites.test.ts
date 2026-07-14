import { describe, expect, it } from "vitest";

import { hashPassword } from "@/lib/auth/password";
import { createProject } from "@/lib/projects/create-project";
import { inviteProjectMember } from "@/lib/projects/invite-member";
import { listMyProjectInvitations } from "@/lib/projects/list-my-invitations";
import { listProjectInvites } from "@/lib/projects/list-project-invites";
import { removeProjectInvitee } from "@/lib/projects/remove-project-invitee";
import {
  acceptProjectInvitation,
  declineProjectInvitation,
} from "@/lib/projects/respond-to-invitation";
import { getProjectDetailForUser } from "@/lib/projects/get-project";
import { PROJECT_USER_ROLE } from "@/lib/rbac/roles";
import { seedSystemRoles } from "@/lib/rbac/seed-roles";
import { Project, ProjectMember, Role, User } from "@/models";
import { authContextFor, projectInput } from "@/tests/helpers/project-test-utils";

describe("Project invitations", () => {
  it("invites a registered user as project_user with invited status", async () => {
    await seedSystemRoles();

    const owner = await User.create({
      name: "Owner",
      email: "invite-owner@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
    });

    const invitee = await User.create({
      name: "Invitee",
      email: "invitee@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
    });

    const { project } = await createProject(
      authContextFor(owner),
      projectInput({
        businessName: "Invite Project",
        websiteUrl: "https://invite.example.com",
      }),
    );

    const { invite } = await inviteProjectMember(
      authContextFor(owner),
      project._id.toString(),
      invitee._id.toString(),
    );

    expect(invite.userId).toBe(invitee._id.toString());
    expect(invite.status).toBe("invited");
    expect(invite.email).toBe("invitee@example.com");

    const member = await ProjectMember.findOne({
      projectId: project._id,
      userId: invitee._id,
    });
    expect(member?.status).toBe("invited");
    expect(member?.invitedByUserId?.toString()).toBe(owner._id.toString());

    const role = await Role.findById(member!.roleId);
    expect(role?.slug).toBe(PROJECT_USER_ROLE);

    const listed = await listProjectInvites(authContextFor(owner), project._id.toString());
    expect(listed).toHaveLength(1);
    expect(listed[0]?.userId).toBe(invitee._id.toString());
  });

  it("rejects invite for unregistered or unverified users", async () => {
    await seedSystemRoles();

    const owner = await User.create({
      name: "Owner",
      email: "invite-owner-2@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
    });

    const unverified = await User.create({
      name: "Unverified",
      email: "unverified-invite@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: null,
      roles: [],
    });

    const { project } = await createProject(
      authContextFor(owner),
      projectInput({
        businessName: "Reject Invite Project",
        websiteUrl: "https://reject-invite.example.com",
      }),
    );

    await expect(
      inviteProjectMember(authContextFor(owner), project._id.toString(), unverified._id.toString()),
    ).rejects.toMatchObject({ statusCode: 422 });

    await expect(
      inviteProjectMember(authContextFor(owner), project._id.toString(), "not-a-valid-id"),
    ).rejects.toMatchObject({ statusCode: 422 });
  });

  it("accepts invitation and grants active membership", async () => {
    await seedSystemRoles();

    const owner = await User.create({
      name: "Owner",
      email: "accept-owner@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
    });

    const invitee = await User.create({
      name: "Invitee",
      email: "accept-invitee@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
    });

    const { project } = await createProject(
      authContextFor(owner),
      projectInput({
        businessName: "Accept Project",
        websiteUrl: "https://accept.example.com",
      }),
    );
    await Project.findByIdAndUpdate(project._id, { status: "active" });

    await inviteProjectMember(
      authContextFor(owner),
      project._id.toString(),
      invitee._id.toString(),
    );

    const pending = await listMyProjectInvitations(authContextFor(invitee));
    expect(pending).toHaveLength(1);
    expect(pending[0]?.projectName).toBe("Accept Project");
    expect(pending[0]?.invitedBy?.name).toBe("Owner");

    await acceptProjectInvitation(authContextFor(invitee), project._id.toString());

    const member = await ProjectMember.findOne({
      projectId: project._id,
      userId: invitee._id,
    });
    expect(member?.status).toBe("active");

    const remaining = await listMyProjectInvitations(authContextFor(invitee));
    expect(remaining).toHaveLength(0);
  });

  it("declines or revokes invitation as removed", async () => {
    await seedSystemRoles();

    const owner = await User.create({
      name: "Owner",
      email: "decline-owner@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
    });

    const invitee = await User.create({
      name: "Invitee",
      email: "decline-invitee@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
    });

    const { project } = await createProject(
      authContextFor(owner),
      projectInput({
        businessName: "Decline Project",
        websiteUrl: "https://decline.example.com",
      }),
    );

    await inviteProjectMember(
      authContextFor(owner),
      project._id.toString(),
      invitee._id.toString(),
    );

    await declineProjectInvitation(authContextFor(invitee), project._id.toString());

    const declined = await ProjectMember.findOne({
      projectId: project._id,
      userId: invitee._id,
    });
    expect(declined?.status).toBe("removed");

    const other = await User.create({
      name: "Other",
      email: "revoke-invitee@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
    });

    await inviteProjectMember(
      authContextFor(owner),
      project._id.toString(),
      other._id.toString(),
    );

    await removeProjectInvitee(
      authContextFor(owner),
      project._id.toString(),
      other._id.toString(),
    );

    const revoked = await ProjectMember.findOne({
      projectId: project._id,
      userId: other._id,
    });
    expect(revoked?.status).toBe("removed");
  });

  it("includes invited users on project detail", async () => {
    await seedSystemRoles();

    const owner = await User.create({
      name: "Owner",
      email: "detail-invite-owner@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
    });

    const invitee = await User.create({
      name: "Invitee",
      email: "detail-invitee@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
    });

    const { project } = await createProject(
      authContextFor(owner),
      projectInput({
        businessName: "Detail Invite Project",
        websiteUrl: "https://detail-invite.example.com",
      }),
    );

    await inviteProjectMember(
      authContextFor(owner),
      project._id.toString(),
      invitee._id.toString(),
    );

    const detail = await getProjectDetailForUser(authContextFor(owner), project._id.toString());
    expect(detail).not.toBeNull();
    expect(detail!.invitedUsers).toHaveLength(1);
    expect(detail!.invitedUsers[0]?.userId).toBe(invitee._id.toString());
    expect(detail!.invitedUsers[0]?.status).toBe("invited");
    expect(detail!.invitedUsers[0]?.email).toBe("detail-invitee@example.com");
  });

  it("removes an accepted project_user from invitedUsers list", async () => {
    await seedSystemRoles();

    const owner = await User.create({
      name: "Owner",
      email: "remove-member-owner@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
    });

    const invitee = await User.create({
      name: "Invitee",
      email: "remove-member-invitee@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
    });

    const { project } = await createProject(
      authContextFor(owner),
      projectInput({
        businessName: "Remove Member Project",
        websiteUrl: "https://remove-member.example.com",
      }),
    );
    await Project.findByIdAndUpdate(project._id, { status: "active" });

    await inviteProjectMember(
      authContextFor(owner),
      project._id.toString(),
      invitee._id.toString(),
    );
    await acceptProjectInvitation(authContextFor(invitee), project._id.toString());

    const before = await getProjectDetailForUser(authContextFor(owner), project._id.toString());
    expect(before!.invitedUsers.some((user) => user.userId === invitee._id.toString() && user.status === "active")).toBe(
      true,
    );

    await removeProjectInvitee(authContextFor(owner), project._id.toString(), invitee._id.toString());

    const after = await getProjectDetailForUser(authContextFor(owner), project._id.toString());
    expect(after!.invitedUsers.some((user) => user.userId === invitee._id.toString())).toBe(false);
  });
});
