import { withApiHandler } from "@/lib/api/handler";
import { ApiResponse } from "@/lib/api/response";
import { runApiGuards } from "@/lib/auth/run-api-guards";
import {
  acceptProjectInvitation,
  buildAcceptProjectInvitationResponse,
} from "@/lib/projects/respond-to-invitation";
import { connectDb } from "@/lib/db/mongoose";

export const POST = withApiHandler(async (request, context) => {
  await connectDb();

  const auth = await runApiGuards(request);
  if (auth instanceof Response) return auth;

  const { projectId } = await context!.params;
  if (!projectId) {
    return ApiResponse.error("Invitation Not Found.", {}, 404);
  }

  await acceptProjectInvitation(auth, projectId);
  return buildAcceptProjectInvitationResponse();
});
