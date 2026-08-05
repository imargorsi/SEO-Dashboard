import { ApiResponse } from "@/lib/api/response";
import { withApiHandler } from "@/lib/api/handler";

type TClientErrorPayload = {
  scope?: string;
  message?: string;
  stack?: string;
  digest?: string;
  url?: string;
  at?: string;
};

export const POST = withApiHandler(async (request) => {
  let body: TClientErrorPayload = {};

  try {
    body = (await request.json()) as TClientErrorPayload;
  } catch {
    return ApiResponse.error("Invalid Request Body.", {}, 400);
  }

  console.error("[client-error]", {
    scope: body.scope ?? "unknown",
    message: body.message?.slice(0, 500),
    digest: body.digest,
    url: body.url,
    at: body.at,
    stack: body.stack?.slice(0, 2000),
  });

  return ApiResponse.success({ received: true });
});
