"use client";

import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { useChangePasswordMutation } from "@/features/auth/auth.api";
import { ApiError } from "@/lib/frontend/api/errors";
import { notify } from "@/lib/frontend/feedback/notify";

export type ChangePasswordFormValues = {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
};

const emptyValues: ChangePasswordFormValues = {
  current_password: "",
  new_password: "",
  new_password_confirmation: "",
};

const passwordFields = ["current_password", "new_password", "new_password_confirmation"] as const;

export function useChangePasswordForm() {
  const { t } = useTranslation("translation", { keyPrefix: "profile.changePassword" });
  const changePasswordMutation = useChangePasswordMutation();

  const form = useForm<ChangePasswordFormValues>({
    defaultValues: emptyValues,
    mode: "onSubmit",
  });

  const {
    register,
    handleSubmit,
    reset,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = form;

  async function onSubmit(values: ChangePasswordFormValues) {
    try {
      const result = await changePasswordMutation.mutateAsync(values);
      reset();
      notify.success(result.message?.trim() || t("successFallback"));
    } catch (error) {
      if (error instanceof ApiError) {
        for (const field of passwordFields) {
          const message = error.errors[field]?.[0];
          if (message) {
            setError(field, { type: "server", message });
          }
        }

        notify.error(error.message?.trim() || error.firstFieldMessage() || t("errorFallback"));
        return;
      }

      notify.error(t("errorFallback"));
    }
  }

  return {
    register,
    handleSubmit,
    watch,
    errors,
    isSubmitting: isSubmitting || changePasswordMutation.isPending,
    onSubmit,
  };
}
