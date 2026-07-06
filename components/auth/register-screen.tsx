"use client";

import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { AuthScreenShell } from "@/components/auth/auth-screen-shell";
import { RegisterFormSection } from "@/sections/register-form-section";
import type { RegisterValues } from "@/sections/register.types";
import { useRegisterMutation } from "@/features/auth/auth.api";
import { ApiError } from "@/lib/frontend/api/errors";
import { notify } from "@/lib/frontend/feedback/notify";

export function RegisterScreen() {
  const router = useRouter();
  const registerMutation = useRegisterMutation();
  const { t } = useTranslation("translation", { keyPrefix: "auth.register" });

  const form = useForm<RegisterValues>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
    },
    mode: "onBlur",
  });

  async function onSubmit(values: RegisterValues) {
    try {
      const email = values.email.trim();
      const result = await registerMutation.mutateAsync({
        name: values.name.trim(),
        email,
        password: values.password,
        password_confirmation: values.password_confirmation,
      });

      const successText = result.message?.trim() || t("submitSuccess");
      router.push(`/?registered=1&email=${encodeURIComponent(email)}&message=${encodeURIComponent(successText)}`);
    } catch (error) {
      notify.error(ApiError.messageFrom(error, t("submitErrorFallback"), "email"));
    }
  }

  return (
    <AuthScreenShell>
      <RegisterFormSection
        register={form.register}
        errors={form.formState.errors}
        isSubmitting={form.formState.isSubmitting || registerMutation.isPending}
        onValidSubmit={form.handleSubmit(onSubmit)}
      />
    </AuthScreenShell>
  );
}
