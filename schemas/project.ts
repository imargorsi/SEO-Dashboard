import { z } from "zod";

import { SEO_GOALS } from "@/lib/projects/constants";
import { WEBSITE_URL_PATTERN, normalizeWebsiteUrl } from "@/lib/projects/website-url.utils";

const optionalText = z.string().trim().max(2000).optional().nullable();
const optionalShortText = z.string().trim().max(255).optional().nullable();

const stringListSchema = z.array(z.string().trim().min(1).max(255)).optional().default([]);

/** Competitors may be full URLs or free-text names. */
const competitorListSchema = z.array(z.string().trim().min(1).max(2048)).optional().default([]);

const websiteUrlSchema = z
  .string()
  .trim()
  .min(1, "Website URL Is Required.")
  .max(2048)
  .regex(WEBSITE_URL_PATTERN, "Enter A Valid Website URL.")
  .transform(normalizeWebsiteUrl);

/** POST /api/v1/projects — request body. */
export const createProjectSchema = z.object({
  businessName: z.string().trim().min(1, "Business Name Is Required.").max(255),
  websiteUrl: websiteUrlSchema,
  businessAddress: optionalText,
  pocContactNumber: optionalShortText,
  servicesOffered: stringListSchema,
  primaryServiceToPromote: optionalShortText,
  idealCustomerProfile: optionalText,
  targetLocations: stringListSchema,
  seoGoals: z.array(z.enum(SEO_GOALS)).optional().default([]),
  competitorUrls: competitorListSchema,
  /** `super_admin` only — regular users must omit this. */
  ownerUserId: z.string().trim().min(1).optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

const updateStringListSchema = z.array(z.string().trim().min(1).max(255)).nullable().optional();
const updateCompetitorListSchema = z.array(z.string().trim().min(1).max(2048)).nullable().optional();

/** PATCH /api/v1/projects/{id} — partial body (business name, owner, and POC email are locked). */
export const updateProjectSchema = z.object({
  websiteUrl: websiteUrlSchema.optional(),
  businessAddress: optionalText,
  pocContactNumber: optionalShortText,
  servicesOffered: updateStringListSchema,
  primaryServiceToPromote: optionalShortText,
  idealCustomerProfile: optionalText,
  targetLocations: updateStringListSchema,
  seoGoals: z.array(z.enum(SEO_GOALS)).nullable().optional(),
  competitorUrls: updateCompetitorListSchema,
});

export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

export const LOCKED_PROJECT_UPDATE_FIELDS = ["businessName", "pocEmail", "ownerUserId"] as const;
