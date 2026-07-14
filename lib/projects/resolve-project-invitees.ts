import { serializeStoredImageUrl } from "@/lib/serializers/stored-image";
import { PROJECT_USER_ROLE } from "@/lib/rbac/roles";
import type { TProjectInvitee } from "@/types/project.types";
import { ProjectMember, Role, User } from "@/models";

/**
 * Pending invites + active project_user members (not owners) for the Invite Users UI.
 */
export async function resolveProjectInvitees(projectId: string): Promise<TProjectInvitee[]> {
  const userRole = await Role.findOne({ slug: PROJECT_USER_ROLE }).select("_id");
  if (!userRole) return [];

  const members = await ProjectMember.find({
    projectId,
    $or: [{ status: "invited" }, { status: "active", roleId: userRole._id }],
  })
    .sort({ createdAt: -1 })
    .select("userId status invitedByUserId");

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
        status: member.status === "active" ? ("active" as const) : ("invited" as const),
        invitedByUserId: member.invitedByUserId?.toString() ?? null,
      },
    ];
  });
}
