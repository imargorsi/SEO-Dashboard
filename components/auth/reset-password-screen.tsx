"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { AuthScreenShell } from "@/components/auth/auth-screen-shell";
import { ResetPasswordFormSection, type ResetPasswordAuthAlert } from "@/sections/reset-password-form-section";
import type { ResetPasswordValues } from "@/sections/reset-password.types";
import { useResetPasswordMutation } from "@/features/auth/auth.api";
import { ApiError } from "@/lib/frontend/api/errors";
import {
  clearResetPasswordSearchParams,
  parseResetPasswordLinkParams,
} from "@/lib/frontend/reset-password-link";

export function ResetPasswordScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resetPasswordMutation = useResetPasswordMutation();
  const { t } = useTranslation("translation", { keyPrefix: "auth.resetPassword" });
  const resetLink = useMemo(
    () => parseResetPasswordLinkParams(new URLSearchParams(searchParams.toString())),
    [searchParams]
  );

  const [resetComplete, setResetComplete] = useState(false);
  const [authAlert, setAuthAlert] = useState<ResetPasswordAuthAlert | null>(null);

  const form = useForm<ResetPasswordValues>({
    defaultValues: { password: "", password_confirmation: "" },
    mode: "onBlur",
  });

  async function onSubmit(values: ResetPasswordValues) {
    if (!resetLink.valid) return;

    setAuthAlert(null);

    try {
      const result = await resetPasswordMutation.mutateAsync({
        token: resetLink.token,
        email: resetLink.email,
        password: values.password,
        password_confirmation: values.password_confirmation,
      });

      setResetComplete(true);
      setAuthAlert({
        variant: "default",
        title: result.message?.trim() || t("submitSuccess"),
      });
      form.reset();

      const nextParams = clearResetPasswordSearchParams(new URLSearchParams(searchParams.toString()));
      const query = nextParams.toString();
      router.replace(query ? `/reset-password?${query}` : "/reset-password", { scroll: false });
    } catch (error) {
      setAuthAlert({
        variant: "destructive",
        title: ApiError.messageFrom(error, t("submitErrorFallback"), "password"),
      });
    }
  }

  return (
    <AuthScreenShell>
      <ResetPasswordFormSection
        register={form.register}
        errors={form.formState.errors}
        isSubmitting={form.formState.isSubmitting || resetPasswordMutation.isPending}
        onValidSubmit={form.handleSubmit(onSubmit)}
        resetComplete={resetComplete}
        authAlert={authAlert}
        invalidLink={!resetLink.valid}
      />
    </AuthScreenShell>
  );
}
