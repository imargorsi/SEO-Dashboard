import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { ApiResponse } from "@/lib/api/response";
import { HttpError, ValidationError, type FieldErrors } from "@/lib/api/http-errors";

function zodToFieldErrors(error: ZodError): FieldErrors {
  const errors: FieldErrors = {};

  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_";
    errors[key] ??= [];
    errors[key].push(issue.message);
  }

  return errors;
}

function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

/** Map thrown errors to Laravel-style `{ success, message, errors }` responses. */
export function handleApiError(error: unknown): NextResponse {
  if (error instanceof HttpError) {
    if (error instanceof ValidationError || error.statusCode === 422) {
      return ApiResponse.validation(error.message, error.errors);
    }

    return ApiResponse.error(error.message, error.errors, error.statusCode);
  }

  if (error instanceof ZodError) {
    const fieldErrors = zodToFieldErrors(error);
    const validationError = ValidationError.fromFieldErrors(fieldErrors);
    return ApiResponse.validation(validationError.message, validationError.errors);
  }

  if (error instanceof Error) {
    console.error(error);
    const message = isProduction() ? "An error occurred." : error.message;
    return ApiResponse.error(message, {}, 500);
  }

  console.error(error);
  return ApiResponse.error("An unexpected error occurred.", {}, 500);
}
