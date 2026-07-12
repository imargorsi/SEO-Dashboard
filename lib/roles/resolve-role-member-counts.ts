import type { Types } from "mongoose";

import { ProjectMember } from "@/models/ProjectMember";

export async function resolveRoleMemberCounts(
  roleIds: Array<Types.ObjectId | string>,
): Promise<Map<string, number>> {
  if (roleIds.length === 0) return new Map();

  const counts = await ProjectMember.aggregate<{ _id: Types.ObjectId; count: number }>([
    { $match: { roleId: { $in: roleIds } } },
    { $group: { _id: "$roleId", count: { $sum: 1 } } },
  ]);

  return new Map(counts.map((entry) => [entry._id.toString(), entry.count]));
}
