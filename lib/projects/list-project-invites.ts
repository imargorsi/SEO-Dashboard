import { NextResponse } from "next/server";

import { ApiResponse } from "@/lib/api/response";
import type { AuthContext } from "@/lib/auth/guards";
import { getProjectForUser } from "@/lib/projects/get-project";
import type { TProjectInviteMemberDto } from "@/lib/projects/invite-member";
import { serializeStoredImageUrl } from "@/lib/serializers/stored-image";
import { ProjectMember, User } from "@/models";

export async function listProjectInvites(
  auth: AuthContext,
  projectId: string,
): Promise<TProjectInviteMemberDto[]> {
  const project = await getProjectForUser(auth, projectId);
  if (!project) {
    return [];
  }

  const members = await ProjectMember.find({
    projectId,
    status: "invited",
  })
    .sort({ createdAt: -1 })
    .select("userId invitedByUserId");

  if (members.length === 0) return [];

  const users = await User.find({
    _id: { $in: members.map((member) => member.userId) },
  }).select("_id name email profileImage");

  const userById = new Map(users.map((user) => [user._id.toString(), user]));

  return members.flatMap((member) => {
    const user = userById.get(member.userId.toString());
    if (!user) return [];

    return [
      {
        id: member._id.toString(),
        userId: user._id.toString(),
        name: user.name,
        email: user.email,
        profileImage: serializeStoredImageUrl(user.profileImage),
        status: "invited" as const,
        invitedByUserId: member.invitedByUserId?.toString() ?? null,
      },
    ];
  });
}

export function buildListProjectInvitesResponse(items: TProjectInviteMemberDto[]): NextResponse {
  return ApiResponse.success({ items });
}
