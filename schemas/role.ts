import { z } from "zod";

const permissionsField = z.array(z.string().min(1)).default([]);

export const createRoleSchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().max(500).default(""),
  permissions: permissionsField,
});

export type CreateRoleInput = z.infer<typeof createRoleSchema>;

// Create and update share the same payload shape (name, description, permissions) — role
// identity (slug, scope, isSystem) is never client-supplied, so one schema covers both.
export const updateRoleSchema = createRoleSchema;

export type UpdateRoleInput = CreateRoleInput;
