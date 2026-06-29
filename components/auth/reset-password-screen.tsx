"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "next/navigation";
import { AuthScreenShell } from "@/components/auth/auth-screen-shell";
import {
  ResetPasswordFormSection,
  type ResetPasswordAuthAlert,
} from "@/sections/reset-password-form-section";
import type { ResetPasswordValues } from "@/sections/reset-password.types";
import { parseResetPasswordLinkParams } from "@/lib/frontend/reset-password-link";

export function ResetPasswordScreen() {
  const searchParams = useSearchParams();
  const resetLink = useMemo(
    () => parseResetPasswordLinkParams(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );

  const [resetComplete, setResetComplete] = useState(false);
  const [authAlert, setAuthAlert] = useState<ResetPasswordAuthAlert | null>(null);

  const form = useForm<ResetPasswordValues>({
    defaultValues: { password: "", password_confirmation: "" },
    mode: "onBlur",
  });

  async function onSubmit(_values: ResetPasswordValues) {
    if (!resetLink.valid) return;

    setAuthAlert(null);
    // API integration pending
    setResetComplete(true);
    form.reset();
  }

  return (
    <AuthScreenShell>
      <ResetPasswordFormSection
        register={form.register}
        errors={form.formState.errors}
        isSubmitting={form.formState.isSubmitting}
        onValidSubmit={form.handleSubmit(onSubmit)}
        resetComplete={resetComplete}
        authAlert={authAlert}
        invalidLink={!resetLink.valid}
      />
    </AuthScreenShell>
  );
}
