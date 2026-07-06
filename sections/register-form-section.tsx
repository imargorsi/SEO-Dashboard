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
import type { RegisterValues } from "@/sections/register.types";

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
    <SignInAuthCardShell
      ariaLabelledBy="register-heading"
      topToolbar={
        <>
          <ThemeToggle tone="ghost" size="sm" />
          <LanguageSwitcher tone="ghost" size="sm" />
        </>
      }
    >
      <Heading id="register-heading" pageTitle>
        {t("title")}
      </Heading>
      <Paragraph className="mt-2 text-sm leading-relaxed">{t("subtitle")}</Paragraph>

      <form className="mt-8 flex flex-col gap-5" onSubmit={onValidSubmit} noValidate>
        <Input
          id="register-name"
          label={t("fullName")}
          type="text"
          placeholder={t("fullNamePh")}
          required
          autoComplete="name"
          error={errors.name?.message ?? ""}
          {...register("name", {
            required: t("fieldRequired"),
            minLength: { value: 2, message: t("fullNameMin") },
          })}
        />

        <Input
          id="register-email"
          label={t("email")}
          type="email"
          placeholder="you@example.com"
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

        <Input
          id="register-password"
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
          id="register-password-confirm"
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

      <Paragraph moreSmaller className="!mt-6 text-center">
        <span className="text-[var(--text-muted)]">{t("hasAccount")} </span>
        <Link href="/" className="text-[var(--brand)] hover:underline">
          {t("signInLink")}
        </Link>
      </Paragraph>
    </SignInAuthCardShell>
  );
}
