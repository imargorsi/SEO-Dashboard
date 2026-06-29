"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { AuthScreenShell } from "@/components/auth/auth-screen-shell";
import { ForgotPasswordFormSection, type ForgotPasswordAuthAlert } from "@/sections/forgot-password-form-section";
import type { ForgotPasswordValues } from "@/sections/forgot-password.types";

export function ForgotPasswordScreen() {
  const [requestSent, setRequestSent] = useState(false);
  const [authAlert, setAuthAlert] = useState<ForgotPasswordAuthAlert | null>(null);

  const form = useForm<ForgotPasswordValues>({
    defaultValues: { email: "" },
    mode: "onBlur",
  });

  async function onSubmit(_values: ForgotPasswordValues) {
    setAuthAlert(null);
    // API integration pending
    setRequestSent(true);
  }

  return (
    <AuthScreenShell>
      <ForgotPasswordFormSection
        register={form.register}
        errors={form.formState.errors}
        isSubmitting={form.formState.isSubmitting}
        onValidSubmit={form.handleSubmit(onSubmit)}
        requestSent={requestSent}
        authAlert={authAlert}
      />
    </AuthScreenShell>
  );
}
