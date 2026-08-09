import { z } from "zod";

import { LEAD_DEFAULT_PER_PAGE, LEAD_MAX_PER_PAGE } from "@/lib/leads/constants";

const emptyToUndefined = (value: unknown) => {
  if (typeof value === "string" && value.trim() === "") {
    return undefined;
  }
  return value;
};

const optionalIsoDate = z.preprocess(
  emptyToUndefined,
  z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter A Valid Date.")
    .optional(),
);

const optionalSearch = z.preprocess(
  emptyToUndefined,
  z.string().trim().max(200, "Search Is Too Long.").optional(),
);

export const listLeadsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  per_page: z.coerce
    .number()
    .int()
    .min(1)
    .max(LEAD_MAX_PER_PAGE)
    .default(LEAD_DEFAULT_PER_PAGE),
  from: optionalIsoDate,
  to: optionalIsoDate,
  q: optionalSearch,
});

export type ListLeadsQueryInput = z.infer<typeof listLeadsQuerySchema>;

export function parseListLeadsQuery(searchParams: URLSearchParams): ListLeadsQueryInput {
  return listLeadsQuerySchema.parse({
    page: searchParams.get("page") ?? undefined,
    per_page: searchParams.get("per_page") ?? undefined,
    from: searchParams.get("from") ?? undefined,
    to: searchParams.get("to") ?? undefined,
    q: searchParams.get("q") ?? undefined,
  });
}
