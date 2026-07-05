"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/input";
import { useChangePasswordForm } from "@/components/forms/hooks/use-change-password-form";

export function ChangePasswordForm() {
  const { register, handleSubmit, watch, errors, onSubmit } = useChangePasswordForm();
  const newPassword = watch("new_password");

  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-5 sm:p-6">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="mb-5">
          <h2 className="text-xl font-semibold text-[var(--text-h)]">Change password</h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">Set a New Account Password.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="new-password"
            type="password"
            label="New Password"
            autoComplete="new-password"
            error={errors.new_password?.message}
            {...register("new_password", {
              required: "New password is required",
              minLength: { value: 8, message: "Password must be at least 8 characters" },
            })}
          />
          <Input
            id="confirm-new-password"
            type="password"
            label="Confirm New Password"
            autoComplete="new-password"
            error={errors.confirm_new_password?.message}
            {...register("confirm_new_password", {
              required: "Please confirm your password",
              validate: (value) => value === newPassword || "Passwords do not match",
            })}
          />
        </div>

        <div className="mt-5 flex justify-end">
          <Button variant="outline" type="submit">
            Save Password
          </Button>
        </div>
      </form>
    </section>
  );
}
