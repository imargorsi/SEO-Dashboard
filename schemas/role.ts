import { z } from "zod";

import { displayNameSchema } from "@/lib/validation/display-name";

const permissionsField = z.array(z.string().min(1)).default([]);

export const createRoleSchema = z.object({
  name: displayNameSchema({ min: 2, minMessage: "Use At Least 2 Characters." }),
  description: z.string().trim().max(500).default(""),
  permissions: permissionsField,
});

export type CreateRoleInput = z.infer<typeof createRoleSchema>;

// Create and update share the same payload shape (name, description, permissions) — role
// identity (slug, scope, isSystem) is never client-supplied, so one schema covers both.
export const updateRoleSchema = createRoleSchema;

export type UpdateRoleInput = CreateRoleInput;
