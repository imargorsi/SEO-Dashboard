/** Typed HTTP errors for API route handlers — caught by `withApiHandler`. */

export type FieldErrors = Record<string, string[]>;

export class HttpError extends Error {
  readonly statusCode: number;
  readonly errors: FieldErrors;

  constructor(statusCode: number, message: string, errors: FieldErrors = {}) {
    super(message);
    this.name = "HttpError";
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

export class ValidationError extends HttpError {
  constructor(fieldErrors: FieldErrors, message = "Validation failed.") {
    super(422, message, fieldErrors);
    this.name = "ValidationError";
  }

  static fromFieldErrors(fieldErrors: FieldErrors): ValidationError {
    return new ValidationError(fieldErrors);
  }

  static formatFieldErrors(errors: FieldErrors): string {
    const formattedMessages = Object.entries(errors).map(([field, messages]) => {
      const fieldName = field.charAt(0).toUpperCase() + field.slice(1);

      if (messages[0] === "Required") {
        return `${fieldName} is required`;
      }

      return messages.join(" and ");
    });

    return formattedMessages.join(", ");
  }
}

export class NotFoundError extends HttpError {
  constructor(resource: string) {
    super(404, `${resource} not found`);
    this.name = "NotFoundError";
  }
}

export class ForbiddenError extends HttpError {
  constructor(message = "Forbidden.") {
    super(403, message);
    this.name = "ForbiddenError";
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message = "Unauthenticated.") {
    super(401, message);
    this.name = "UnauthorizedError";
  }
}

export class TooManyRequestsError extends HttpError {
  constructor(message = "Too many requests.") {
    super(429, message);
    this.name = "TooManyRequestsError";
  }
}
