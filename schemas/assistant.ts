import { z } from "zod";

export const assistantQuerySchema = z.object({
  query: z
    .string()
    .trim()
    .min(1, "Query Is Required.")
    .max(500, "Query Must Be 500 Characters Or Fewer."),
});

export type AssistantQueryInput = z.infer<typeof assistantQuerySchema>;
