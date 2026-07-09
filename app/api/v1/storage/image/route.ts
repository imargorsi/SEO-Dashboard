import { get } from "@vercel/blob";
import { NextResponse } from "next/server";
import { withApiHandler } from "@/lib/api/handler";
import { ApiResponse } from "@/lib/api/response";
import { hasValidImageSignature } from "@/lib/auth/signed-url";

export const GET = withApiHandler(async (request) => {
  if (!hasValidImageSignature(request.url)) {
    return ApiResponse.error("Invalid Or Expired Image URL.", {}, 403);
  }

  const { searchParams } = new URL(request.url);
  const pathname = searchParams.get("pathname");

  if (!pathname) {
    return ApiResponse.validation("Missing Image Path.", {
      pathname: ["Missing Image Path."],
    });
  }

  const blob = await get(pathname, { access: "private" });
  if (!blob || blob.statusCode !== 200) {
    return ApiResponse.error("Image Not Found.", {}, 404);
  }

  return new NextResponse(blob.stream, {
    headers: {
      "Content-Type": blob.blob.contentType,
      "Cache-Control": "private, max-age=0, must-revalidate",
      "X-Content-Type-Options": "nosniff",
    },
  });
});
