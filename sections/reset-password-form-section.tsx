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
import type { ResetPasswordValues } from "@/sections/reset-password.types";

type ResetPasswordFormSectionProps = {
  register: UseFormRegister<ResetPasswordValues>;
  errors: FieldErrors<ResetPasswordValues>;
  isSubmitting: boolean;
  onValidSubmit: () => void;
  resetComplete: boolean;
  invalidLink?: boolean;
};

export function ResetPasswordFormSection({
  register,
  errors,
  isSubmitting,
  onValidSubmit,
  resetComplete,
  invalidLink = false,
}: ResetPasswordFormSectionProps) {
  const { t } = useTranslation("translation", { keyPrefix: "auth.resetPassword" });

  return (
    <SignInAuthCardShell ariaLabelledBy="reset-password-heading">
      <AuthFormHeader
        id="reset-password-heading"
        title={invalidLink ? t("invalidLinkTitle") : t("title")}
        subtitle={invalidLink ? t("invalidLinkBody") : t("subtitle")}
        subtitleClassName={invalidLink ? "text-destructive" : undefined}
      />

      {invalidLink ? (
        <Paragraph moreSmaller className={authFormFooterClass}>
          <Link
            href="/"
            className="font-semibold text-brand transition-[color,filter] hover:brightness-110 hover:underline"
          >
            {t("backToSignIn")}
          </Link>
        </Paragraph>
      ) : (
        <>
          {resetComplete ? (
            <Paragraph className="mt-8 type-body leading-relaxed text-text-secondary">
              {t("submitSuccess")}
            </Paragraph>
          ) : (
            <form className="mt-8 flex flex-col gap-4" onSubmit={onValidSubmit} noValidate>
              <AuthInput
                id="reset-password-new"
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
                id="reset-password-confirm"
                label={t("confirmPassword")}
                type="password"
                placeholder="••••••••"
                required
                autoComplete="new-password"
                startIcon={<Icons.lock className="size-4" />}
                error={errors.password_confirmation?.message ?? ""}
                {...register("password_confirmation", {
                  required: t("fieldRequired"),
                  validate: (value, formValues) =>
                    value === formValues.password || t("passwordMismatch"),
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
        </>
      )}
    </SignInAuthCardShell>
  );
}
