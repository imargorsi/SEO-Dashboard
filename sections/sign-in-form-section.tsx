"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { IoLockClosedOutline, IoMailOutline } from "react-icons/io5";

import { AuthFormHeader } from "@/components/auth/auth-form-header";
import { AuthInput } from "@/components/auth/auth-input";
import { AuthSubmitButton } from "@/components/auth/auth-submit-button";
import { GoogleAuthButton } from "@/components/auth/google-auth-button";
import { Paragraph } from "@/components/paragraph";
import { SignInAuthCardShell } from "@/components/sign-in-auth-card-shell";
import { Spinner } from "@/components/ui/spinner";
import { authFormFooterClass } from "@/lib/frontend/layout/auth-chrome";
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
    <SignInAuthCardShell ariaLabelledBy="sign-in-heading">
      <AuthFormHeader id="sign-in-heading" title={t("title")} subtitle={t("subtitle")} />

      <form className="mt-8 flex flex-col gap-4" onSubmit={onValidSubmit} noValidate>
        <AuthInput
          id="sign-in-email"
          label={t("email")}
          type="email"
          placeholder="you@company.com"
          required
          autoComplete="email"
          startIcon={<IoMailOutline className="size-4" />}
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
          id="sign-in-password"
          label={t("password")}
          type="password"
          placeholder="••••••••"
          required
          autoComplete="current-password"
          startIcon={<IoLockClosedOutline className="size-4" />}
          error={errors.password?.message ?? ""}
          {...register("password", {
            required: t("fieldRequired"),
          })}
        />

        <div className="-mt-0.5 flex justify-end">
          <Link
            href="/forgot-password"
            className="type-caption font-medium text-brand transition-[color,filter] hover:brightness-110 hover:underline"
          >
            {t("forgotPassword")}
          </Link>
        </div>

        <AuthSubmitButton disabled={isSubmitting} className="mt-1">
          {isSubmitting ? <Spinner className="size-4 shrink-0 text-text-on-brand" /> : null}
          {t("submit")}
        </AuthSubmitButton>
      </form>

      <GoogleAuthButton disabled={isSubmitting} />

      <Paragraph moreSmaller className={authFormFooterClass}>
        <span className="text-text-muted">{t("noAccountPrompt")} </span>
        <Link
          href="/register"
          className="font-semibold text-brand transition-[color,filter] hover:brightness-110 hover:underline"
        >
          {t("registerCta")}
        </Link>
      </Paragraph>
    </SignInAuthCardShell>
  );
}
