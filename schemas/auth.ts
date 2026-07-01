import { z } from "zod";

const emailSchema = z.string().email().max(255);
const passwordSchema = z.string().min(8);

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
});

export const registerSchema = z
  .object({
    name: z.string().min(1).max(255),
    email: emailSchema.transform((v) => v.toLowerCase()),
    password: passwordSchema,
    password_confirmation: z.string().min(1),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "The password confirmation does not match.",
    path: ["password_confirmation"],
  });

/** @deprecated Legacy company sign-up — use `registerSchema` for user-only registration. */
export const registerCompanySchema = z
  .object({
    company_name: z.string().min(1).max(255),
    poc_name: z.string().min(1).max(255),
    poc_email: emailSchema.transform((v) => v.toLowerCase()),
    password: passwordSchema,
    password_confirmation: z.string().min(1),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "The password confirmation does not match.",
    path: ["password_confirmation"],
  });

export const forgotPasswordSchema = z.object({
  email: emailSchema.transform((v) => v.toLowerCase()),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    email: emailSchema.transform((v) => v.toLowerCase()),
    password: passwordSchema,
    password_confirmation: z.string().min(1),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "The password confirmation does not match.",
    path: ["password_confirmation"],
  });
