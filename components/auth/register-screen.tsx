"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { AuthScreenShell } from "@/components/auth/auth-screen-shell";
import { RegisterFormSection, type RegisterAuthAlert } from "@/sections/register-form-section";
import type { RegisterValues } from "@/sections/register.types";
import { useRegisterCompanyMutation } from "@/features/auth/auth.api";
import { ApiError } from "@/lib/frontend/api/errors";

export function RegisterScreen() {
  const router = useRouter();
  const registerMutation = useRegisterCompanyMutation();
  const { t } = useTranslation("translation", { keyPrefix: "auth.register" });
  const [authAlert, setAuthAlert] = useState<RegisterAuthAlert | null>(null);

  const form = useForm<RegisterValues>({
    defaultValues: {
      company_name: "",
      poc_name: "",
      poc_email: "",
      password: "",
      password_confirmation: "",
    },
    mode: "onBlur",
  });

  async function onSubmit(values: RegisterValues) {
    setAuthAlert(null);

    try {
      const pocEmail = values.poc_email.trim();
      const result = await registerMutation.mutateAsync({
        company_name: values.company_name.trim(),
        poc_name: values.poc_name.trim(),
        poc_email: pocEmail,
        password: values.password,
        password_confirmation: values.password_confirmation,
      });

      const successText = result.message?.trim() || t("submitSuccess");
      router.push(`/?registered=1&email=${encodeURIComponent(pocEmail)}&message=${encodeURIComponent(successText)}`);
    } catch (error) {
      setAuthAlert({
        variant: "destructive",
        title: ApiError.messageFrom(error, t("submitErrorFallback"), "poc_email"),
      });
    }
  }

  return (
    <AuthScreenShell>
      <RegisterFormSection
        register={form.register}
        errors={form.formState.errors}
        isSubmitting={form.formState.isSubmitting || registerMutation.isPending}
        onValidSubmit={form.handleSubmit(onSubmit)}
        authAlert={authAlert}
      />
    </AuthScreenShell>
  );
}
