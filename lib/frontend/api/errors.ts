export type ApiFieldErrors = Record<string, string[]>;

export class ApiError extends Error {
  readonly status: number;
  readonly errors: ApiFieldErrors;
  readonly body: unknown;

  constructor(message: string, status: number, errors: ApiFieldErrors = {}, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
    this.body = body;
  }

  firstFieldMessage(field?: string): string | null {
    if (field) {
      const messages = this.errors[field];
      if (messages?.[0]) return messages[0];
    }
    for (const messages of Object.values(this.errors)) {
      if (messages[0]) return messages[0];
    }
    return null;
  }

  static messageFrom(error: unknown, fallback: string, field?: string): string {
    if (error instanceof ApiError) {
      return error.firstFieldMessage(field) ?? error.message ?? fallback;
    }
    if (error instanceof Error && error.message) {
      return error.message;
    }
    return fallback;
  }
}
