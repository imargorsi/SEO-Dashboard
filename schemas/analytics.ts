import { z } from "zod";

import {
  ANALYTICS_DIMENSION_TYPES,
  ANALYTICS_MAX_RANGE_DAYS,
  ANALYTICS_SOURCES,
  GOOGLE_INTEGRATION_SERVICES,
} from "@/lib/integrations/constants";
import { inclusiveDaySpan } from "@/lib/integrations/date.utils";

export const googleIntegrationServiceSchema = z.enum(GOOGLE_INTEGRATION_SERVICES);

export const connectGoogleIntegrationSchema = z.object({
  externalPropertyId: z
    .string()
    .trim()
    .min(1, "Property Id Is Required.")
    .max(512, "Property Id Is Too Long."),
});

export type ConnectGoogleIntegrationInput = z.infer<typeof connectGoogleIntegrationSchema>;

const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date Must Be YYYY-MM-DD.");

function refineDateRange(
  value: { from: string; to: string },
  ctx: z.RefinementCtx,
): void {
  if (value.from > value.to) {
    ctx.addIssue({
      code: "custom",
      path: ["from"],
      message: "From Date Must Be On Or Before To Date.",
    });
    return;
  }

  if (inclusiveDaySpan(value.from, value.to) > ANALYTICS_MAX_RANGE_DAYS) {
    ctx.addIssue({
      code: "custom",
      path: ["to"],
      message: `Date Range Must Be ${ANALYTICS_MAX_RANGE_DAYS} Days Or Fewer.`,
    });
  }
}

export const analyticsOverviewQuerySchema = z
  .object({
    from: isoDateSchema,
    to: isoDateSchema,
  })
  .superRefine(refineDateRange);

export type AnalyticsOverviewQuery = z.infer<typeof analyticsOverviewQuerySchema>;

export function parseAnalyticsOverviewQuery(searchParams: URLSearchParams): AnalyticsOverviewQuery {
  return analyticsOverviewQuerySchema.parse({
    from: searchParams.get("from") ?? undefined,
    to: searchParams.get("to") ?? undefined,
  });
}

export const analyticsDimensionsQuerySchema = z
  .object({
    from: isoDateSchema,
    to: isoDateSchema,
    source: z.enum(ANALYTICS_SOURCES),
    dimensionType: z.enum(ANALYTICS_DIMENSION_TYPES),
    limit: z.coerce.number().int().min(1).max(100).default(25),
  })
  .superRefine(refineDateRange);

export type AnalyticsDimensionsQuery = z.infer<typeof analyticsDimensionsQuerySchema>;

export function parseAnalyticsDimensionsQuery(
  searchParams: URLSearchParams,
): AnalyticsDimensionsQuery {
  return analyticsDimensionsQuerySchema.parse({
    from: searchParams.get("from") ?? undefined,
    to: searchParams.get("to") ?? undefined,
    source: searchParams.get("source") ?? undefined,
    dimensionType: searchParams.get("dimensionType") ?? undefined,
    limit: searchParams.get("limit") ?? undefined,
  });
}
