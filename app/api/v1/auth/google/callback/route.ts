import { withApiHandler } from "@/lib/api/handler";
import { handleGoogleOAuthCallback } from "@/lib/auth/google-oauth";
import { connectDb } from "@/lib/db/mongoose";

/** Google redirects here with ?code=&state= — we finish linking and bounce to the app. */
export const GET = withApiHandler(async (request) => {
  await connectDb();
  const url = new URL(request.url);
  return handleGoogleOAuthCallback({
    code: url.searchParams.get("code"),
    state: url.searchParams.get("state"),
  });
});
