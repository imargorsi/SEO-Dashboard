import { ApiResponse } from "@/lib/api/response";
import { withApiHandler } from "@/lib/api/handler";
import {
  clientIp,
  ensureRouteNotRateLimited,
  recordRouteAttempt,
} from "@/lib/auth/rate-limit";

type TClientErrorPayload = {
  scope?: string;
  message?: string;
  stack?: string;
  digest?: string;
  url?: string;
  at?: string;
};

const MAX_BODY_BYTES = 16_384;

export const POST = withApiHandler(async (request) => {
  const ip = clientIp(request);
  const retryAfter = ensureRouteNotRateLimited("client-errors", ip, 20);
  if (retryAfter !== null) {
    return ApiResponse.error(`Too Many Requests. Try Again In ${retryAfter} Seconds.`, {}, 429);
  }
  recordRouteAttempt("client-errors", ip);

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return ApiResponse.error("Payload Too Large.", {}, 413);
  }

  let body: TClientErrorPayload = {};
  if (raw.trim()) {
    try {
      body = JSON.parse(raw) as TClientErrorPayload;
    } catch {
      return ApiResponse.error("Invalid Request Body.", {}, 400);
    }
  }

  console.error("[client-error]", {
    scope: String(body.scope ?? "unknown").slice(0, 80),
    message: String(body.message ?? "").slice(0, 500),
    digest: body.digest ? String(body.digest).slice(0, 120) : undefined,
    url: body.url ? String(body.url).slice(0, 500) : undefined,
    at: body.at ? String(body.at).slice(0, 64) : undefined,
    stack: body.stack ? String(body.stack).slice(0, 2000) : undefined,
  });

  return ApiResponse.success({ received: true });
});
