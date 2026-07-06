import { ApiResponse } from "@/lib/api/response";
import { withApiHandler } from "@/lib/api/handler";

export const GET = withApiHandler(async () => {
  return ApiResponse.success({ message: "pong" });
});
