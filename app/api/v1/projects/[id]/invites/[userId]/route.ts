import { withApiHandler } from "@/lib/api/handler";
import { ApiResponse } from "@/lib/api/response";
import { runApiGuards } from "@/lib/auth/run-api-guards";
import { getProjectAccessForUser } from "@/lib/projects/get-project-access";
import {
  buildRemoveProjectInviteeResponse,
  removeProjectInvitee,
} from "@/lib/projects/remove-project-invitee";
import { hasAnyPermission } from "@/lib/rbac/access";
import { connectDb } from "@/lib/db/mongoose";

export const DELETE = withApiHandler(async (_request, context) => {
  await connectDb();

  const auth = await runApiGuards(_request);
  if (auth instanceof Response) return auth;

  const params = await context!.params;
  const projectId = params.id;
  const userId = params.userId;

  if (!projectId || !userId) {
    return ApiResponse.error("Invitation Not Found.", {}, 404);
  }

  const access = await getProjectAccessForUser(auth, projectId);
  if (!access || !hasAnyPermission(access.permissions, ["members.invite", "members.remove"])) {
    return ApiResponse.error("Forbidden.", {}, 403);
  }

  const { removedStatus } = await removeProjectInvitee(auth, projectId, userId);
  return buildRemoveProjectInviteeResponse(removedStatus);
});
