import { z } from "zod";

import { withApiHandler } from "@/lib/api/handler";
import { exchangeGoogleOAuthCode } from "@/lib/auth/google-oauth";
import { connectDb } from "@/lib/db/mongoose";

const exchangeSchema = z.object({
  code: z.string().min(1),
});

/** Exchange one-time OAuth code for the normal bearer login payload. */
export const POST = withApiHandler(async (request) => {
  await connectDb();
  const body = exchangeSchema.parse(await request.json());
  return exchangeGoogleOAuthCode(body.code);
});
