import { withApiHandler } from "@/lib/api/handler";
import { runApiGuards } from "@/lib/auth/run-api-guards";
import {
  buildListMyProjectInvitationsResponse,
  listMyProjectInvitations,
} from "@/lib/projects/list-my-invitations";
import { connectDb } from "@/lib/db/mongoose";

export const GET = withApiHandler(async (request) => {
  await connectDb();

  const auth = await runApiGuards(request);
  if (auth instanceof Response) return auth;

  const items = await listMyProjectInvitations(auth);
  return buildListMyProjectInvitationsResponse(items);
});
