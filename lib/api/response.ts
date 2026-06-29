import { NextResponse } from "next/server";

type ErrorMap = Record<string, string[] | string>;

type PaginatedPayload<T> = {
  items: T[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    has_more_pages: boolean;
    links: {
      first: string | null;
      last: string | null;
      prev: string | null;
      next: string | null;
    };
  };
  filters: Record<string, unknown>;
};

export const ApiResponse = {
  success<T>(data: T | null = null, message: string | null = null, status = 200) {
    return NextResponse.json({ success: true, message, data }, { status });
  },

  error(message: string, errors: ErrorMap = {}, status = 400) {
    return NextResponse.json(
      {
        success: false,
        message,
        errors: Object.keys(errors).length === 0 ? {} : errors,
      },
      { status }
    );
  },

  validation(message: string, errors: Record<string, string[]>, status = 422) {
    return this.error(message, errors, status);
  },

  paginated<T>(
    items: T[],
    pagination: PaginatedPayload<T>["pagination"],
    filters: Record<string, unknown> = {},
    message: string | null = null
  ) {
    return this.success({ items, pagination, filters }, message);
  },
};
