import { withApiHandler } from "@/lib/api/handler";
import { googleOAuthStartResponse } from "@/lib/auth/google-oauth";

/** Start Google OAuth — redirects the browser to Google. */
export const GET = withApiHandler(async () => googleOAuthStartResponse());
