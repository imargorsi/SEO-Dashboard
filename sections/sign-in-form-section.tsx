"use client";

import type { FieldErrors, UseFormRegister } from "react-hook-form";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { SignInAuthCardShell } from "@/components/sign-in-auth-card-shell";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { Heading } from "@/components/heading";
import { Input } from "@/components/input";
import { Paragraph } from "@/components/paragraph";
import { AuthSubmitButton } from "@/components/auth/auth-submit-button";
import { Spinner } from "@/components/ui/spinner";
import type { SignInValues } from "@/sections/sign-in.types";

type SignInFormSectionProps = {
  register: UseFormRegister<SignInValues>;
  errors: FieldErrors<SignInValues>;
  isSubmitting: boolean;
  onValidSubmit: () => void;
};

export function SignInFormSection({
  register,
  errors,
  isSubmitting,
  onValidSubmit,
}: SignInFormSectionProps) {
  const { t } = useTranslation("translation", { keyPrefix: "auth.signIn" });

  return (
    <SignInAuthCardShell
      ariaLabelledBy="sign-in-heading"
      topToolbar={
        <>
          <ThemeToggle tone="ghost" size="sm" />
          <LanguageSwitcher tone="ghost" size="sm" />
        </>
      }
    >
      <Heading id="sign-in-heading" pageTitle>
        {t("title")}
      </Heading>
      <Paragraph className="mt-2 text-sm leading-relaxed">{t("subtitle")}</Paragraph>

      <form className="mt-8 flex flex-col gap-5" onSubmit={onValidSubmit} noValidate>
        <Input
          id="sign-in-email"
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

        <Input
          id="sign-in-password"
          label={t("password")}
          type="password"
          placeholder="••••••••"
          required
          autoComplete="current-password"
          error={errors.password?.message ?? ""}
          {...register("password", {
            required: t("fieldRequired"),
            minLength: { value: 6, message: t("passwordMin") },
          })}
        />

        <AuthSubmitButton disabled={isSubmitting} className="mt-1">
          {isSubmitting ? <Spinner className="size-4 shrink-0 text-white" /> : null}
          {t("submit")}
        </AuthSubmitButton>
      </form>

      <div className="mt-2 flex flex-col gap-3">
        <Paragraph moreSmaller className="text-right">
          <Link href="/forgot-password" className="text-[var(--brand)] hover:underline">
            {t("forgotPassword")}
          </Link>
        </Paragraph>

        <Paragraph moreSmaller className="border-t border-[var(--border)] pt-4 text-center leading-relaxed">
          <span className="text-[var(--text-muted)]">{t("noAccountPrompt")} </span>
          <Link href="/register" className="font-medium text-[var(--brand)] hover:underline">
            {t("registerCta")}
          </Link>
        </Paragraph>
      </div>
    </SignInAuthCardShell>
  );
}
