"use client";

import { IoAlertCircle, IoCheckmarkCircle } from "react-icons/io5";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { useChangePasswordForm } from "@/components/forms/hooks/use-change-password-form";

export function ChangePasswordForm() {
  const { register, handleSubmit, watch, errors, formAlert, isSubmitting, onSubmit } = useChangePasswordForm();
  const newPassword = watch("new_password");

  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-5 sm:p-6">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="mb-5">
          <h2 className="text-xl font-semibold text-[var(--text-h)]">Change password</h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">Set a New Account Password.</p>
        </div>

        {formAlert ? (
          <Alert variant={formAlert.variant} className="mb-5">
            {formAlert.variant === "destructive" ? (
              <IoAlertCircle className="size-4 shrink-0" aria-hidden />
            ) : (
              <IoCheckmarkCircle className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden />
            )}
            <AlertTitle>{formAlert.title}</AlertTitle>
            {formAlert.description ? <AlertDescription>{formAlert.description}</AlertDescription> : null}
          </Alert>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Input
              id="current-password"
              type="password"
              label="Current Password"
              autoComplete="current-password"
              error={errors.current_password?.message}
              {...register("current_password", {
                required: "Current password is required",
              })}
            />
          </div>
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
            error={errors.new_password_confirmation?.message}
            {...register("new_password_confirmation", {
              required: "Please confirm your password",
              validate: (value) => value === newPassword || "Passwords do not match",
            })}
          />
        </div>

        <div className="mt-5 flex justify-end">
          <Button variant="outline" type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
            <span className="inline-flex items-center gap-2">
              {isSubmitting ? <Spinner className="size-4 shrink-0" /> : null}
              {isSubmitting ? "Saving…" : "Save Password"}
            </span>
          </Button>
        </div>
      </form>
    </section>
  );
}
