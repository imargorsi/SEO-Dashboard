import { z } from "zod";

export const assistantQuerySchema = z.object({
  query: z
    .string()
    .trim()
    .min(1, "Query is required.")
    .max(500, "Query must be 500 characters or fewer."),
});

export type AssistantQueryInput = z.infer<typeof assistantQuerySchema>;
