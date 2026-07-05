"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { useChangePasswordMutation } from "@/features/auth/auth.api";
import { ApiError } from "@/lib/frontend/api/errors";

export type ChangePasswordFormValues = {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
};

export type ChangePasswordFormAlert =
  | { variant: "default"; title: string; description?: string }
  | { variant: "destructive"; title: string; description?: string };

const emptyValues: ChangePasswordFormValues = {
  current_password: "",
  new_password: "",
  new_password_confirmation: "",
};

const passwordFields = ["current_password", "new_password", "new_password_confirmation"] as const;

export function useChangePasswordForm() {
  const { t } = useTranslation("translation", { keyPrefix: "profile.changePassword" });
  const changePasswordMutation = useChangePasswordMutation();
  const [formAlert, setFormAlert] = useState<ChangePasswordFormAlert | null>(null);

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
    setFormAlert(null);

    try {
      const result = await changePasswordMutation.mutateAsync(values);
      reset();
      setFormAlert({
        variant: "default",
        title: t("successTitle"),
        description: result.message?.trim() || t("successFallback"),
      });
    } catch (error) {
      if (error instanceof ApiError) {
        let attachedFieldError = false;

        for (const field of passwordFields) {
          const message = error.errors[field]?.[0];
          if (message) {
            setError(field, { type: "server", message });
            attachedFieldError = true;
          }
        }

        const apiMessage = error.message?.trim() || null;
        setFormAlert({
          variant: "destructive",
          title: t("errorTitle"),
          description: apiMessage ?? (attachedFieldError ? undefined : t("errorFallback")),
        });
        return;
      }

      setFormAlert({
        variant: "destructive",
        title: t("errorTitle"),
        description: t("errorFallback"),
      });
    }
  }

  return {
    register,
    handleSubmit,
    watch,
    errors,
    formAlert,
    isSubmitting: isSubmitting || changePasswordMutation.isPending,
    onSubmit,
  };
}
