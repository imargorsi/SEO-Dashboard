import { z } from "zod";

import { ValidationError } from "@/lib/api/http-errors";
import { SEO_ACTIVITY_TYPES } from "@/lib/seo-activities/constants";
import { sanitizeHttpUrl } from "@/lib/seo-activities/sanitize-url";
import type { TSeoActivityType } from "@/types/seo-activity.types";

const isoDateSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter A Valid Date.")
  .refine((value) => {
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(year!, month! - 1, day);
    return (
      date.getFullYear() === year &&
      date.getMonth() === month! - 1 &&
      date.getDate() === day
    );
  }, "Enter A Valid Date.");

const httpUrlSchema = z
  .string()
  .trim()
  .min(1, "Url Is Required.")
  .refine((value) => Boolean(sanitizeHttpUrl(value)), "Enter A Valid Http Or Https Url.")
  .transform((value) => sanitizeHttpUrl(value)!);

const contentFields = {
  url: httpUrlSchema,
  occurredOn: isoDateSchema,
  title: z.string().trim().optional(),
  anchorText: z.string().trim().optional(),
  details: z.string().trim().optional(),
};

function refineTypeSpecificFields(
  data: {
    title?: string;
    anchorText?: string;
    details?: string;
  },
  ctx: z.RefinementCtx,
  type: TSeoActivityType,
) {
  if (type === "blogs") {
    if (!data.title || data.title.length < 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["title"],
        message: "Title Must Be At Least 3 Characters.",
      });
    }
    return;
  }

  if (type === "backlinks") {
    if (!data.anchorText || data.anchorText.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["anchorText"],
        message: "Anchor Text Must Be At Least 2 Characters.",
      });
    }
    return;
  }

  if (!data.details || data.details.length < 4) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["details"],
      message: "Details Must Be At Least 4 Characters.",
    });
  }
}

export const createSeoActivitySchema = z
  .object({
    type: z.enum(SEO_ACTIVITY_TYPES),
    ...contentFields,
  })
  .superRefine((data, ctx) => {
    refineTypeSpecificFields(data, ctx, data.type);
  });

export type CreateSeoActivityInput = z.infer<typeof createSeoActivitySchema>;

export type UpdateSeoActivityInput = {
  url: string;
  occurredOn: string;
  title?: string;
  anchorText?: string;
  details?: string;
};

export function parseUpdateSeoActivityInput(
  activityType: TSeoActivityType,
  body: unknown,
): UpdateSeoActivityInput {
  const schema = z
    .object({
      type: z.literal(activityType).optional(),
      ...contentFields,
    })
    .superRefine((data, ctx) => {
      refineTypeSpecificFields(data, ctx, activityType);
    });

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] ? String(issue.path[0]) : "body";
      fieldErrors[key] = [...(fieldErrors[key] ?? []), issue.message];
    }
    throw ValidationError.fromFieldErrors(fieldErrors);
  }

  return {
    url: parsed.data.url,
    occurredOn: parsed.data.occurredOn,
    title: parsed.data.title,
    anchorText: parsed.data.anchorText,
    details: parsed.data.details,
  };
}
