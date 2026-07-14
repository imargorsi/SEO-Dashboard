import { ZodError } from "zod";

import { withApiHandler } from "@/lib/api/handler";
import { ApiResponse } from "@/lib/api/response";
import { runApiGuards } from "@/lib/auth/run-api-guards";
import { requireProjectPermission } from "@/lib/projects/get-project-access";
import {
  buildInviteProjectMemberResponse,
  inviteProjectMember,
} from "@/lib/projects/invite-member";
import {
  buildListProjectInvitesResponse,
  listProjectInvites,
} from "@/lib/projects/list-project-invites";
import { connectDb } from "@/lib/db/mongoose";
import { inviteProjectMemberSchema } from "@/schemas/invite-project-member";

export const GET = withApiHandler(async (request, context) => {
  await connectDb();

  const auth = await runApiGuards(request);
  if (auth instanceof Response) return auth;

  const { id } = await context!.params;
  if (!id) {
    return ApiResponse.error("Project Not Found.", {}, 404);
  }

  const permissionError = await requireProjectPermission(auth, id, "members.view");
  if (permissionError) return permissionError;

  const items = await listProjectInvites(auth, id);
  return buildListProjectInvitesResponse(items);
});

export const POST = withApiHandler(async (request, context) => {
  await connectDb();

  const auth = await runApiGuards(request);
  if (auth instanceof Response) return auth;

  const { id } = await context!.params;
  if (!id) {
    return ApiResponse.error("Project Not Found.", {}, 404);
  }

  const permissionError = await requireProjectPermission(auth, id, "members.invite");
  if (permissionError) return permissionError;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return ApiResponse.validation("Invalid Request Body.", {
      body: ["Request Body Must Be Valid JSON."],
    });
  }

  let input;
  try {
    input = inviteProjectMemberSchema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      return ApiResponse.validation("Validation Failed.", {
        userId: error.issues.map((issue) => issue.message),
      });
    }
    throw error;
  }

  const { invite, emailSent } = await inviteProjectMember(auth, id, input.userId);
  return buildInviteProjectMemberResponse(invite, emailSent);
});
