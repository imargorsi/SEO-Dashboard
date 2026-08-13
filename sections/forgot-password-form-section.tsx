"use client";

import { Icons } from "@/lib/frontend/icons/app-icons";

import type { FieldErrors, UseFormRegister } from "react-hook-form";
import Link from "next/link";
import { useTranslation } from "react-i18next";

import { AuthFormHeader } from "@/components/auth/auth-form-header";
import { AuthInput } from "@/components/auth/auth-input";
import { AuthSubmitButton } from "@/components/auth/auth-submit-button";
import { SignInAuthCardShell } from "@/components/sign-in-auth-card-shell";
import { Paragraph } from "@/components/paragraph";
import { Spinner } from "@/components/ui/spinner";
import { authFormFooterClass } from "@/lib/frontend/layout/auth-chrome";
import type { ForgotPasswordValues } from "@/sections/forgot-password.types";

type ForgotPasswordFormSectionProps = {
  register: UseFormRegister<ForgotPasswordValues>;
  errors: FieldErrors<ForgotPasswordValues>;
  isSubmitting: boolean;
  onValidSubmit: () => void;
  requestSent: boolean;
};

export function ForgotPasswordFormSection({
  register,
  errors,
  isSubmitting,
  onValidSubmit,
  requestSent,
}: ForgotPasswordFormSectionProps) {
  const { t } = useTranslation("translation", { keyPrefix: "auth.forgotPassword" });

  return (
    <SignInAuthCardShell ariaLabelledBy="forgot-password-heading">
      <AuthFormHeader
        id="forgot-password-heading"
        title={t("title")}
        subtitle={requestSent ? t("submitSuccess") : t("subtitle")}
      />

      {requestSent ? null : (
        <form className="mt-8 flex flex-col gap-4" onSubmit={onValidSubmit} noValidate>
          <AuthInput
            id="forgot-password-email"
            label={t("email")}
            type="email"
            placeholder="you@company.com"
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

          <AuthSubmitButton disabled={isSubmitting} className="mt-1">
            {isSubmitting ? <Spinner className="size-4 shrink-0 text-text-on-brand" /> : null}
            {t("submit")}
          </AuthSubmitButton>
        </form>
      )}

      <Paragraph moreSmaller className={authFormFooterClass}>
        <Link
          href="/"
          className="font-semibold text-brand transition-[color,filter] hover:brightness-110 hover:underline"
        >
          {t("backToSignIn")}
        </Link>
      </Paragraph>
    </SignInAuthCardShell>
  );
}
