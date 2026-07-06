"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { AuthScreenShell } from "@/components/auth/auth-screen-shell";
import { ForgotPasswordFormSection } from "@/sections/forgot-password-form-section";
import type { ForgotPasswordValues } from "@/sections/forgot-password.types";
import { useForgotPasswordMutation } from "@/features/auth/auth.api";
import { ApiError } from "@/lib/frontend/api/errors";
import { notify } from "@/lib/frontend/feedback/notify";

export function ForgotPasswordScreen() {
  const forgotPasswordMutation = useForgotPasswordMutation();
  const { t } = useTranslation("translation", { keyPrefix: "auth.forgotPassword" });
  const [requestSent, setRequestSent] = useState(false);

  const form = useForm<ForgotPasswordValues>({
    defaultValues: { email: "" },
    mode: "onBlur",
  });

  async function onSubmit(values: ForgotPasswordValues) {
    try {
      const result = await forgotPasswordMutation.mutateAsync({
        email: values.email.trim(),
      });

      setRequestSent(true);
      notify.success(result.message?.trim() || t("submitSuccess"));
    } catch (error) {
      notify.error(ApiError.messageFrom(error, t("submitErrorFallback"), "email"));
    }
  }

  return (
    <AuthScreenShell>
      <ForgotPasswordFormSection
        register={form.register}
        errors={form.formState.errors}
        isSubmitting={form.formState.isSubmitting || forgotPasswordMutation.isPending}
        onValidSubmit={form.handleSubmit(onSubmit)}
        requestSent={requestSent}
      />
    </AuthScreenShell>
  );
}
