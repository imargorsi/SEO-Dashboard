"use client";

import type { FieldErrors, UseFormRegister } from "react-hook-form";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { SignInAuthCardShell } from "@/components/sign-in-auth-card-shell";
import { Heading } from "@/components/heading";
import { Input } from "@/components/input";
import { Paragraph } from "@/components/paragraph";
import { AuthSubmitButton } from "@/components/auth/auth-submit-button";
import { Spinner } from "@/components/ui/spinner";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
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
    <SignInAuthCardShell
      ariaLabelledBy="reset-password-heading"
      topToolbar={
        <>
          <ThemeToggle tone="ghost" size="sm" />
          <LanguageSwitcher tone="ghost" size="sm" />
        </>
      }
    >
      <Heading id="reset-password-heading" pageTitle>
        {t("title")}
      </Heading>

      {invalidLink ? (
        <>
          <Paragraph className="mt-5 text-sm leading-relaxed text-destructive">
            {t("invalidLinkBody")}
          </Paragraph>
          <Paragraph moreSmaller className="mt-6! text-center">
            <Link href="/" className="font-semibold text-brand-orange transition-colors hover:text-brand-magenta hover:underline">
              {t("backToSignIn")}
            </Link>
          </Paragraph>
        </>
      ) : (
        <>
          <Paragraph className="mt-2 text-sm font-normal leading-relaxed text-text-secondary">{t("subtitle")}</Paragraph>

          {resetComplete ? (
            <Paragraph className="mt-7 text-sm font-normal leading-relaxed text-text-secondary">{t("submitSuccess")}</Paragraph>
          ) : (
            <form className="mt-7 flex flex-col gap-4.5" onSubmit={onValidSubmit} noValidate>
              <Input
                id="reset-password-new"
                label={t("password")}
                type="password"
                placeholder="••••••••"
                required
                autoComplete="new-password"
                error={errors.password?.message ?? ""}
                {...register("password", {
                  required: t("fieldRequired"),
                  minLength: { value: 8, message: t("passwordMin") },
                })}
              />

              <Input
                id="reset-password-confirm"
                label={t("confirmPassword")}
                type="password"
                placeholder="••••••••"
                required
                autoComplete="new-password"
                error={errors.password_confirmation?.message ?? ""}
                {...register("password_confirmation", {
                  required: t("fieldRequired"),
                  validate: (value, formValues) => value === formValues.password || t("passwordMismatch"),
                })}
              />

              <AuthSubmitButton disabled={isSubmitting} className="mt-1">
                {isSubmitting ? <Spinner className="size-4 shrink-0 text-white" /> : null}
                {t("submit")}
              </AuthSubmitButton>
            </form>
          )}

          <Paragraph moreSmaller className="mt-6! text-center">
            <Link href="/" className="font-semibold text-brand-orange transition-colors hover:text-brand-magenta hover:underline">
              {t("backToSignIn")}
            </Link>
          </Paragraph>
        </>
      )}
    </SignInAuthCardShell>
  );
}
