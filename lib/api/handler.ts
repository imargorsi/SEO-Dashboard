import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { ApiResponse } from "@/lib/api/response";

type RouteHandler = (
  request: Request,
  context?: { params: Promise<Record<string, string>> },
) => Promise<NextResponse>;

export function withApiHandler(handler: RouteHandler): RouteHandler {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: Record<string, string[]> = {};
        for (const issue of error.issues) {
          const key = issue.path.join(".") || "_";
          errors[key] ??= [];
          errors[key].push(issue.message);
        }
        return ApiResponse.validation("Validation failed.", errors);
      }

      console.error(error);
      return ApiResponse.error("An error occurred.", {}, 500);
    }
  };
}
