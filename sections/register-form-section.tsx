"use client";

import { Icons } from "@/lib/frontend/icons/app-icons";

import type { FieldErrors, UseFormRegister } from "react-hook-form";
import Link from "next/link";
import { useTranslation } from "react-i18next";

import { AuthFormHeader } from "@/components/auth/auth-form-header";
import { AuthInput } from "@/components/auth/auth-input";
import { AuthSubmitButton } from "@/components/auth/auth-submit-button";
import { GoogleAuthButton } from "@/components/auth/google-auth-button";
import { SignInAuthCardShell } from "@/components/sign-in-auth-card-shell";
import { Paragraph } from "@/components/paragraph";
import { Spinner } from "@/components/ui/spinner";
import { authFormFooterClass } from "@/lib/frontend/layout/auth-chrome";
import type { RegisterValues } from "@/sections/register.types";
import { DISPLAY_NAME_MAX_LENGTH } from "@/lib/validation/display-name";

type RegisterFormSectionProps = {
  register: UseFormRegister<RegisterValues>;
  errors: FieldErrors<RegisterValues>;
  isSubmitting: boolean;
  onValidSubmit: () => void;
};

export function RegisterFormSection({
  register,
  errors,
  isSubmitting,
  onValidSubmit,
}: RegisterFormSectionProps) {
  const { t } = useTranslation("translation", { keyPrefix: "auth.register" });

  return (
    <SignInAuthCardShell ariaLabelledBy="register-heading">
      <AuthFormHeader id="register-heading" title={t("title")} subtitle={t("subtitle")} />

      <form className="mt-8 flex flex-col gap-4" onSubmit={onValidSubmit} noValidate>
        <AuthInput
          id="register-name"
          label={t("fullName")}
          type="text"
          placeholder={t("fullNamePh")}
          required
          maxLength={DISPLAY_NAME_MAX_LENGTH}
          autoComplete="name"
          startIcon={<Icons.user className="size-4" />}
          error={errors.name?.message ?? ""}
          {...register("name", {
            required: t("fieldRequired"),
            minLength: { value: 2, message: t("fullNameMin") },
            maxLength: { value: DISPLAY_NAME_MAX_LENGTH, message: t("fullNameMax") },
          })}
        />

        <AuthInput
          id="register-email"
          label={t("email")}
          type="email"
          placeholder="you@example.com"
          required
          autoComplete="email"
          startIcon={<Icons.mail className="size-4" />}
          error={errors.email?.message ?? ""}
          {...register("email", {
            required: t("fieldRequired"),
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: t("emailInvalid"),
            },
          })}
        />

        <AuthInput
          id="register-password"
          label={t("password")}
          type="password"
          placeholder="••••••••"
          required
          autoComplete="new-password"
          startIcon={<Icons.lock className="size-4" />}
          error={errors.password?.message ?? ""}
          {...register("password", {
            required: t("fieldRequired"),
            minLength: { value: 8, message: t("passwordMin") },
          })}
        />

        <AuthInput
          id="register-password-confirm"
          label={t("confirmPassword")}
          type="password"
          placeholder="••••••••"
          required
          autoComplete="new-password"
          startIcon={<Icons.lock className="size-4" />}
          error={errors.password_confirmation?.message ?? ""}
          {...register("password_confirmation", {
            required: t("fieldRequired"),
            validate: (value, formValues) => value === formValues.password || t("passwordMismatch"),
          })}
        />

        <AuthSubmitButton disabled={isSubmitting} className="mt-1">
          {isSubmitting ? <Spinner className="size-4 shrink-0 text-text-on-brand" /> : null}
          {t("submit")}
        </AuthSubmitButton>
      </form>

      <GoogleAuthButton disabled={isSubmitting} />

      <Paragraph moreSmaller className={authFormFooterClass}>
        <span className="text-text-muted">{t("hasAccount")} </span>
        <Link
          href="/"
          className="font-semibold text-brand transition-[color,filter] hover:brightness-110 hover:underline"
        >
          {t("signInLink")}
        </Link>
      </Paragraph>
    </SignInAuthCardShell>
  );
}
