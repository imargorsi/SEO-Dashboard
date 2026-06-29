import type { FieldErrors, UseFormRegister } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { SignInAuthCardShell } from "@/components/SignInAuthCardShell.tsx"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Heading } from "../components/Heading.tsx"
import { Input } from "../components/Input.tsx"
import { Paragraph } from "../components/Paragraph.tsx"
import { Button as MovingBorderButton } from "@/components/ui/moving-border"
import { Spinner } from "@/components/ui/spinner"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"
import { ThemeToggle } from "@/components/ThemeToggle"
import type { RegisterValues } from "./register.types.ts"

export type RegisterAuthAlert =
  | { variant: "default"; title: string; description?: string }
  | { variant: "destructive"; title: string; description?: string }

type RegisterFormSectionProps = {
  register: UseFormRegister<RegisterValues>
  errors: FieldErrors<RegisterValues>
  isSubmitting: boolean
  onValidSubmit: () => void
  onBackToSignIn: () => void
  authAlert?: RegisterAuthAlert | null
}

export function RegisterFormSection({
  register,
  errors,
  isSubmitting,
  onValidSubmit,
  onBackToSignIn,
  authAlert = null,
}: RegisterFormSectionProps) {
  const { t } = useTranslation("translation", { keyPrefix: "auth.register" })

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

      <form
          className="mt-8 flex flex-col gap-5"
          onSubmit={onValidSubmit}
          noValidate
        >
          <Input
            id="register-company-name"
            label={t("companyName")}
            type="text"
            placeholder={t("companyNamePh")}
            required
            autoComplete="organization"
            error={errors.company_name?.message ?? ""}
            {...register("company_name", {
              required: t("fieldRequired"),
              minLength: { value: 2, message: t("companyNameMin") },
            })}
          />

          <Input
            id="register-poc-name"
            label={t("contactPersonName")}
            type="text"
            placeholder={t("contactPersonNamePh")}
            required
            autoComplete="name"
            error={errors.poc_name?.message ?? ""}
            {...register("poc_name", {
              required: t("fieldRequired"),
              minLength: { value: 2, message: t("contactPersonNameMin") },
            })}
          />

          <Input
            id="register-poc-email"
            label={t("contactPersonEmail")}
            type="email"
            placeholder="contact@company.com"
            required
            autoComplete="email"
            error={errors.poc_email?.message ?? ""}
            {...register("poc_email", {
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

      <Paragraph moreSmaller className="!mt-6 text-center">
        <span className="text-[var(--text-muted)]">{t("hasAccount")} </span>
        <button
          type="button"
          onClick={onBackToSignIn}
          className="text-[var(--brand)] hover:underline"
        >
          {t("signInLink")}
        </button>
      </Paragraph>
    </SignInAuthCardShell>
  )
}
