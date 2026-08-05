import { z } from "zod";

/** Max length for user-facing names and short titles (user, project, role, activity title). */
export const DISPLAY_NAME_MAX_LENGTH = 50;

export const DISPLAY_NAME_MAX_MESSAGE = "Use At Most 50 Characters.";

/** Shared Zod string for display names / short titles. */
export function displayNameSchema(options?: {
  min?: number;
  minMessage?: string;
  requiredMessage?: string;
}) {
  const min = options?.min ?? 1;
  const minMessage =
    options?.requiredMessage ??
    options?.minMessage ??
    (min <= 1 ? "Name Is Required." : `Use At Least ${min} Characters.`);

  return z
    .string()
    .trim()
    .min(min, minMessage)
    .max(DISPLAY_NAME_MAX_LENGTH, DISPLAY_NAME_MAX_MESSAGE);
}
