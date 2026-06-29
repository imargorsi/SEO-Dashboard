import { useState } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { AlertCircle, CheckCircle2 } from "lucide-react"

import { FormTextField } from "@/components/form/FormTextField"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button as AnimatedSubmitButton } from "@/components/ui/moving-border"
import { Spinner } from "@/components/ui/spinner"
import {
  changePassword,
  type ChangePasswordApiPayload,
} from "@/lib/auth/changePasswordApi"

type ChangePasswordFormValues = {
  current_password: string
  password: string
  password_confirmation: string
}

const emptyValues: ChangePasswordFormValues = {
  current_password: "",
  password: "",
  password_confirmation: "",
}

export function ChangePasswordForm() {
  const { t } = useTranslation("translation", {
    keyPrefix: "profile.changePassword",
  })
  const [formAlert, setFormAlert] = useState<
    | { variant: "default"; title: string; description?: string }
    | { variant: "destructive"; title: string; description?: string }
    | null
  >(null)

  const form = useForm<ChangePasswordFormValues>({
    defaultValues: emptyValues,
    mode: "onSubmit",
  })

  const {
    control,
    handleSubmit,
    reset,
    setError,
    getValues,
    formState: { isSubmitting },
  } = form

  async function onSubmit(values: ChangePasswordFormValues) {
    setFormAlert(null)
    try {
      const payload: ChangePasswordApiPayload = {
        current_password: values.current_password,
        password: values.password,
        password_confirmation: values.password_confirmation,
      }
      const json = await changePassword(payload)
      const apiMsg =
        typeof json.message === "string" && json.message.trim()
          ? json.message.trim()
          : null

      if (!json.success) {
        const errs = json.errors ?? {}
        let attachedFieldError = false
        for (const key of [
          "current_password",
          "password",
          "password_confirmation",
        ] as const) {
          const fieldErrs = errs[key]
          if (fieldErrs && fieldErrs.length > 0) {
            setError(key, { type: "server", message: fieldErrs[0] })
            attachedFieldError = true
          }
        }
        if (!attachedFieldError) {
          setFormAlert({
            variant: "destructive",
            title: t("errorTitle"),
            description: apiMsg ?? t("errorFallback"),
          })
        } else if (apiMsg) {
          setFormAlert({
            variant: "destructive",
            title: t("errorTitle"),
            description: apiMsg,
          })
        }
        return
      }

      setFormAlert({
        variant: "default",
        title: t("successTitle"),
        description: apiMsg ?? t("successFallback"),
      })
      reset(emptyValues)
    } catch (e) {
      setFormAlert({
        variant: "destructive",
        title: t("errorTitle"),
        description:
          e instanceof Error ? e.message : t("errorFallback"),
      })
    }
  }

  return (
    <div className="mx-auto w-[100%] max-w-full rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-6 shadow-[var(--shadow)] sm:p-8">
      <div className="mb-8 space-y-1">
        <h2 className="text-lg font-semibold text-[var(--text-h)]">
          {t("title")}
        </h2>
        <p className="text-sm text-[var(--text-muted)]">{t("lead")}</p>
      </div>

      {formAlert ? (
        <Alert variant={formAlert.variant} className="mb-6">
          {formAlert.variant === "destructive" ? (
            <AlertCircle className="size-4 shrink-0" aria-hidden />
          ) : (
            <CheckCircle2
              className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400"
              aria-hidden
            />
          )}
          <AlertTitle>{formAlert.title}</AlertTitle>
          {formAlert.description ? (
            <AlertDescription>{formAlert.description}</AlertDescription>
          ) : null}
        </Alert>
      ) : null}

      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormTextField
          control={control}
          name="current_password"
          type="password"
          autoComplete="current-password"
          label={t("currentPassword")}
          placeholder={t("currentPasswordPh")}
          rules={{ required: t("valRequired") }}
        />
        <FormTextField
          control={control}
          name="password"
          type="password"
          autoComplete="new-password"
          label={t("newPassword")}
          placeholder={t("newPasswordPh")}
          rules={{
            required: t("valRequired"),
            minLength: { value: 8, message: t("valMin") },
          }}
        />
        <FormTextField
          control={control}
          name="password_confirmation"
          type="password"
          autoComplete="new-password"
          label={t("confirmPassword")}
          placeholder={t("confirmPasswordPh")}
          rules={{
            required: t("valRequired"),
            validate: (v) =>
              v === getValues("password") || t("valMatch"),
          }}
        />

        <div className="flex flex-col gap-4 border-t border-[var(--border)] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <AnimatedSubmitButton
            type="submit"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            borderRadius="0.5rem"
            containerClassName="w-full max-w-full sm:w-auto sm:min-w-[11rem] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)] disabled:pointer-events-none disabled:opacity-60"
          >
            <span className="inline-flex items-center justify-center gap-2 px-1">
              {isSubmitting ? (
                <Spinner className="size-4 shrink-0 text-[var(--motion-btn-fg)]" />
              ) : null}
              {isSubmitting ? t("submitting") : t("submit")}
            </span>
          </AnimatedSubmitButton>
          <Link
            to="/dashboard"
            className="text-center text-sm font-medium text-[var(--brand)] hover:underline sm:text-end"
          >
            {t("cancel")}
          </Link>
        </div>
      </form>
    </div>
  )
}
