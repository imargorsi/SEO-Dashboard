import { NextResponse } from "next/server";

import { ApiResponse } from "@/lib/api/response";
import type { AuthContext } from "@/lib/auth/guards";
import { serializeStoredImageUrl } from "@/lib/serializers/stored-image";
import type { TMyProjectInvitation } from "@/types/project-invite.types";
import { Project, ProjectMember, User } from "@/models";

export type TMyProjectInvitationDto = TMyProjectInvitation;

export async function listMyProjectInvitations(
  auth: AuthContext,
): Promise<TMyProjectInvitationDto[]> {
  const memberships = await ProjectMember.find({
    userId: auth.user._id,
    status: "invited",
  })
    .sort({ createdAt: -1 })
    .select("projectId invitedByUserId createdAt");

  if (memberships.length === 0) return [];

  const projects = await Project.find({
    _id: { $in: memberships.map((membership) => membership.projectId) },
  }).select("_id businessName logoImage status");

  const projectById = new Map(projects.map((project) => [project._id.toString(), project]));

  const inviterIds = [
    ...new Set(
      memberships
        .map((membership) => membership.invitedByUserId?.toString())
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  const inviters = inviterIds.length
    ? await User.find({ _id: { $in: inviterIds } }).select("_id name profileImage")
    : [];
  const inviterById = new Map(inviters.map((user) => [user._id.toString(), user]));

  return memberships.flatMap((membership) => {
    const project = projectById.get(membership.projectId.toString());
    if (!project || project.status === "rejected") return [];

    const inviterId = membership.invitedByUserId?.toString() ?? null;
    const inviter = inviterId ? inviterById.get(inviterId) : null;

    return [
      {
        projectId: project._id.toString(),
        projectName: project.businessName,
        projectImageUrl: serializeStoredImageUrl(project.logoImage),
        invitedAt: membership.createdAt.toISOString(),
        invitedBy: inviter
          ? {
              id: inviter._id.toString(),
              name: inviter.name,
              profileImage: serializeStoredImageUrl(inviter.profileImage),
            }
          : null,
      },
    ];
  });
}

export function buildListMyProjectInvitationsResponse(
  items: TMyProjectInvitationDto[],
): NextResponse {
  return ApiResponse.success({ items });
}
