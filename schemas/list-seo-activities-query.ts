import { z } from "zod";

import {
  SEO_ACTIVITY_DEFAULT_PER_PAGE,
  SEO_ACTIVITY_DEFAULT_TYPE,
  SEO_ACTIVITY_MAX_PER_PAGE,
  SEO_ACTIVITY_TYPES,
} from "@/lib/seo-activities/constants";

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

export const listSeoActivitiesQuerySchema = z.object({
  type: z.enum(SEO_ACTIVITY_TYPES).default(SEO_ACTIVITY_DEFAULT_TYPE),
  page: z.coerce.number().int().min(1).default(1),
  per_page: z.coerce
    .number()
    .int()
    .min(1)
    .max(SEO_ACTIVITY_MAX_PER_PAGE)
    .default(SEO_ACTIVITY_DEFAULT_PER_PAGE),
  from: optionalIsoDate,
  to: optionalIsoDate,
});

export type ListSeoActivitiesQueryInput = z.infer<typeof listSeoActivitiesQuerySchema>;

export function parseListSeoActivitiesQuery(
  searchParams: URLSearchParams,
): ListSeoActivitiesQueryInput {
  return listSeoActivitiesQuerySchema.parse({
    type: searchParams.get("type") ?? undefined,
    page: searchParams.get("page") ?? undefined,
    per_page: searchParams.get("per_page") ?? undefined,
    from: searchParams.get("from") ?? undefined,
    to: searchParams.get("to") ?? undefined,
  });
}
