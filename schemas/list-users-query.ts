import { z } from "zod";

import { USER_ACCOUNT_STATUSES } from "@/lib/users/constants";

const emptyToUndefined = (value: unknown) => {
  if (typeof value === "string" && value.trim() === "") {
    return undefined;
  }
  return value;
};

const parseNewest = (value: unknown) => {
  if (value === "false" || value === false || value === "0") {
    return false;
  }
  return true;
};

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  per_page: z.coerce.number().int().min(1).max(100).default(15),
  search: z.preprocess(emptyToUndefined, z.string().trim().min(1).optional()),
  newest: z.preprocess(parseNewest, z.boolean().default(true)),
  status: z.enum(USER_ACCOUNT_STATUSES).optional(),
});

export type ListUsersQueryInput = z.infer<typeof listUsersQuerySchema>;

export function parseListUsersQuery(searchParams: URLSearchParams): ListUsersQueryInput {
  const page = searchParams.get("page");
  const perPage = searchParams.get("per_page");
  const search = searchParams.get("search");
  const newest = searchParams.get("newest");
  const status = searchParams.get("status");

  return listUsersQuerySchema.parse({
    page: page ?? undefined,
    per_page: perPage ?? undefined,
    search: search ?? undefined,
    newest: newest ?? undefined,
    status: status ?? undefined,
  });
}
