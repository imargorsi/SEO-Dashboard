import { z } from "zod";

export const createUserSchema = z
  .object({
    name: z.string().min(1).max(255),
    email: z.string().email().max(255).transform((v) => v.toLowerCase()),
    password: z.string().min(8),
    password_confirmation: z.string().min(1),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "The Password Confirmation Does Not Match.",
    path: ["password_confirmation"],
  });

export type CreateUserInput = z.infer<typeof createUserSchema>;

const optionalPassword = z.preprocess((value) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}, z.string().min(8).optional());

export const updateUserSchema = z
  .object({
    name: z.string().min(1).max(255),
    email: z.string().email().max(255).transform((v) => v.toLowerCase()),
    password: optionalPassword,
    password_confirmation: z.preprocess((value) => {
      if (typeof value !== "string") return value;
      const trimmed = value.trim();
      return trimmed === "" ? undefined : trimmed;
    }, z.string().optional()),
  })
  .superRefine((data, ctx) => {
    if (data.password && data.password !== data.password_confirmation) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "The Password Confirmation Does Not Match.",
        path: ["password_confirmation"],
      });
    }
  });

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
