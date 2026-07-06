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
    <SignInAuthCardShell
      ariaLabelledBy="forgot-password-heading"
      topToolbar={
        <>
          <ThemeToggle tone="ghost" size="sm" />
          <LanguageSwitcher tone="ghost" size="sm" />
        </>
      }
    >
      <Heading id="forgot-password-heading" pageTitle>
        {t("title")}
      </Heading>
      <Paragraph className="mt-2 text-sm leading-relaxed">{t("subtitle")}</Paragraph>

      {requestSent ? (
        <Paragraph className="mt-8 text-sm leading-relaxed">{t("submitSuccess")}</Paragraph>
      ) : (
        <form className="mt-8 flex flex-col gap-5" onSubmit={onValidSubmit} noValidate>
          <Input
            id="forgot-password-email"
            label={t("email")}
            type="email"
            placeholder="you@company.com"
            required
            autoComplete="email"
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
    </SignInAuthCardShell>
  );
}
