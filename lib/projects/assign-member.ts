import type { Types } from "mongoose";

import type { ProjectMemberStatus } from "@/lib/projects/constants";
import { resolveProjectRoleBySlug } from "@/lib/projects/resolve-role";
import { ProjectMember, type ProjectMemberDocument } from "@/models/ProjectMember";

export type AssignProjectMemberInput = {
  projectId: Types.ObjectId | string;
  userId: Types.ObjectId | string;
  roleSlug: string;
  status?: ProjectMemberStatus;
};

/**
 * Links a user to a project with a role template from the `roles` collection.
 * Upserts when the same user is already a member (updates roleId + status).
 */
export async function assignProjectMember(
  input: AssignProjectMemberInput,
): Promise<ProjectMemberDocument> {
  const role = await resolveProjectRoleBySlug(input.roleSlug);

  const member = await ProjectMember.findOneAndUpdate(
    { projectId: input.projectId, userId: input.userId },
    {
      $set: {
        roleId: role._id,
        status: input.status ?? "active",
      },
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
  );

  return member;
}
