import { z } from "zod";

import { SEO_ACTIVITY_LIST_DEFAULT_PER_PAGE } from "@/lib/seo-activities/constants";
import { SEO_ACTIVITY_TYPES } from "@/types/seo-activity.types";

export const listSeoActivitiesQuerySchema = z.object({
  type: z.enum(SEO_ACTIVITY_TYPES).default("blogs"),
  page: z.coerce.number().int().min(1).default(1),
  per_page: z.coerce
    .number()
    .int()
    .min(1)
    .max(50)
    .optional()
    .default(SEO_ACTIVITY_LIST_DEFAULT_PER_PAGE),
});

export type ListSeoActivitiesQueryInput = z.infer<typeof listSeoActivitiesQuerySchema>;

export function parseListSeoActivitiesQuery(
  searchParams: URLSearchParams,
): ListSeoActivitiesQueryInput {
  return listSeoActivitiesQuerySchema.parse({
    type: searchParams.get("type") ?? undefined,
    page: searchParams.get("page") ?? undefined,
    per_page: searchParams.get("per_page") ?? undefined,
  });
}
