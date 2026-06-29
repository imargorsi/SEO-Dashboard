"use client";

import type { FieldErrors, UseFormRegister } from "react-hook-form";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { IoAlertCircle, IoCheckmarkCircle } from "react-icons/io5";
import { SignInAuthCardShell } from "@/components/sign-in-auth-card-shell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Heading } from "@/components/heading";
import { Input } from "@/components/input";
import { Paragraph } from "@/components/paragraph";
import { AuthSubmitButton } from "@/components/auth/auth-submit-button";
import { Spinner } from "@/components/ui/spinner";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import type { ResetPasswordValues } from "@/sections/reset-password.types";

export type ResetPasswordAuthAlert =
  | { variant: "default"; title: string; description?: string }
  | { variant: "destructive"; title: string; description?: string };

type ResetPasswordFormSectionProps = {
  register: UseFormRegister<ResetPasswordValues>;
  errors: FieldErrors<ResetPasswordValues>;
  isSubmitting: boolean;
  onValidSubmit: () => void;
  resetComplete: boolean;
  authAlert?: ResetPasswordAuthAlert | null;
  invalidLink?: boolean;
};

export function ResetPasswordFormSection({
  register,
  errors,
  isSubmitting,
  onValidSubmit,
  resetComplete,
  authAlert = null,
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
          <Alert variant="destructive" className="mt-5">
            <IoAlertCircle className="size-4 shrink-0" aria-hidden />
            <AlertTitle>{t("invalidLinkTitle")}</AlertTitle>
            <AlertDescription>{t("invalidLinkBody")}</AlertDescription>
          </Alert>
          <Paragraph moreSmaller className="!mt-6 text-center">
            <Link href="/" className="text-[var(--brand)] hover:underline">
              {t("backToSignIn")}
            </Link>
          </Paragraph>
        </>
      ) : (
        <>
          <Paragraph className="mt-2 text-sm leading-relaxed">{t("subtitle")}</Paragraph>

          {authAlert ? (
            <Alert variant={authAlert.variant} className="mt-5">
              {authAlert.variant === "destructive" ? (
                <IoAlertCircle className="size-4 shrink-0" aria-hidden />
              ) : (
                <IoCheckmarkCircle className="size-4 shrink-0" aria-hidden />
              )}
              <AlertTitle>{authAlert.title}</AlertTitle>
              {authAlert.description ? <AlertDescription>{authAlert.description}</AlertDescription> : null}
            </Alert>
          ) : null}

          {resetComplete ? (
            !authAlert ? (
              <Paragraph className="mt-8 text-sm leading-relaxed">{t("submitSuccess")}</Paragraph>
            ) : null
          ) : (
            <form className="mt-8 flex flex-col gap-5" onSubmit={onValidSubmit} noValidate>
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

          <Paragraph moreSmaller className="!mt-6 text-center">
            <Link href="/" className="text-[var(--brand)] hover:underline">
              {t("backToSignIn")}
            </Link>
          </Paragraph>
        </>
      )}
    </SignInAuthCardShell>
  );
}
