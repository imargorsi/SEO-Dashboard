"use client";

import type { FieldErrors, UseFormRegister } from "react-hook-form";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { SignInAuthCardShell } from "@/components/sign-in-auth-card-shell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Heading } from "@/components/heading";
import { Input } from "@/components/input";
import { Paragraph } from "@/components/paragraph";
import { Button as MovingBorderButton } from "@/components/ui/moving-border";
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
            <AlertCircle className="size-4 shrink-0" aria-hidden />
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
                <AlertCircle className="size-4 shrink-0" aria-hidden />
              ) : (
                <CheckCircle2 className="size-4 shrink-0" aria-hidden />
              )}
              <AlertTitle>{authAlert.title}</AlertTitle>
              {authAlert.description ? (
                <AlertDescription>{authAlert.description}</AlertDescription>
              ) : null}
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
                  validate: (value, formValues) =>
                    value === formValues.password || t("passwordMismatch"),
                })}
              />

              <MovingBorderButton
                type="submit"
                disabled={isSubmitting}
                aria-busy={isSubmitting}
                borderRadius="0.5rem"
                containerClassName="mt-1 w-full max-w-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)] disabled:pointer-events-none disabled:opacity-60"
              >
                <span className="inline-flex items-center justify-center gap-2">
                  {isSubmitting ? (
                    <Spinner className="size-4 shrink-0 text-[var(--motion-btn-fg)]" />
                  ) : null}
                  {t("submit")}
                </span>
              </MovingBorderButton>
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
