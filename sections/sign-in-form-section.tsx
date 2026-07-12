"use client";

import type { FieldErrors, UseFormRegister } from "react-hook-form";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { FcGoogle } from "react-icons/fc";
import { SignInAuthCardShell } from "@/components/sign-in-auth-card-shell";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Heading } from "@/components/heading";
import { Input } from "@/components/input";
import { Paragraph } from "@/components/paragraph";
import { AuthSubmitButton } from "@/components/auth/auth-submit-button";
import { Button } from "@/components/ui/button";
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
      topToolbar={<LanguageSwitcher tone="ghost" size="sm" />}
    >
      <Heading id="sign-in-heading" heroTitle >
        {t("title")}
      </Heading>
      <Paragraph className="mt-2 text-sm font-normal leading-relaxed text-text-secondary">{t("subtitle")}</Paragraph>

      <form className="mt-7 flex flex-col gap-4.5" onSubmit={onValidSubmit} noValidate>
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

        <div className="-mt-1 flex justify-end">
          <Link href="/forgot-password" className="type-caption text-text-secondary transition-colors hover:text-text-primary hover:underline">
            {t("forgotPassword")}
          </Link>
        </div>

        <AuthSubmitButton disabled={isSubmitting} className="mt-0.5">
          {isSubmitting ? <Spinner className="size-4 shrink-0 text-text-on-brand" /> : null}
          {t("submit")}
        </AuthSubmitButton>
      </form>

      <div className="mt-6">
        <div className="flex items-center gap-3 type-overline text-text-muted">
          <span className="h-px flex-1 bg-border" aria-hidden />
          <span>{t("continueWith")}</span>
          <span className="h-px flex-1 bg-border" aria-hidden />
        </div>

        <div className="mt-4">
          <Button type="button" variant="outlined" size="lg" className="w-full">
            <FcGoogle className="size-4 shrink-0" aria-hidden />
            <span>{t("continueGoogle")}</span>
          </Button>
        </div>
      </div>

      <div className="mt-6 pt-2">
        <Paragraph moreSmaller className="text-center leading-relaxed">
          <span className="text-text-muted">{t("noAccountPrompt")} </span>
          <Link
            href="/register"
            className="font-semibold text-brand transition-colors hover:brightness-110 hover:underline"
          >
            {t("registerCta")}
          </Link>
        </Paragraph>
      </div>
    </SignInAuthCardShell>
  );
}
