import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { Link, useNavigate } from "react-router-dom"
import { AlertCircle, CheckCircle2 } from "lucide-react"

import { FormCheckboxField } from "@/components/form/FormCheckboxField"
import { FormTextField } from "@/components/form/FormTextField"
import type { CreateCompanyFormValues } from "@/components/forms/createCompanyForm.types"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button as AnimatedSubmitButton } from "@/components/ui/moving-border"
import { Spinner } from "@/components/ui/spinner"
import { postCompany, putCompany } from "@/lib/admin/createCompanyApi"

const emptyValues: CreateCompanyFormValues = {
  company_name: "",
  poc_name: "",
  poc_email: "",
  status_active: true,
}

function toPayload(values: CreateCompanyFormValues) {
  return {
    company_name: values.company_name.trim(),
    poc_name: values.poc_name.trim(),
    poc_email: values.poc_email.trim(),
    is_active: values.status_active,
  }
}

type CreateCompanyFormProps = {
  companyId?: number
  initialValues?: CreateCompanyFormValues
}

export function CreateCompanyForm({
  companyId,
  initialValues,
}: CreateCompanyFormProps) {
  const isEdit = companyId != null && Number.isFinite(companyId)
  const navigate = useNavigate()
  const { t } = useTranslation("translation", { keyPrefix: "modules.companies" })
  const [formAlert, setFormAlert] = useState<
    | { variant: "default"; title: string; description?: string }
    | { variant: "destructive"; title: string; description?: string }
    | null
  >(null)

  const form = useForm<CreateCompanyFormValues>({
    defaultValues: initialValues ?? emptyValues,
    mode: "onSubmit",
  })

  const { control, handleSubmit, reset, formState: { isSubmitting } } = form

  useEffect(() => {
    if (initialValues) {
      reset(initialValues)
    }
  }, [initialValues, reset])

  async function onSubmit(values: CreateCompanyFormValues) {
    setFormAlert(null)
    try {
      const payload = toPayload(values)
      const json = isEdit
        ? await putCompany(companyId!, payload)
        : await postCompany(payload)
      const msg =
        (typeof json.message === "string" && json.message.trim()) ||
        (isEdit ? t("createForm.editSuccessFallback") : t("createForm.successFallback"))

      if (isEdit) {
        navigate("/companies", {
          replace: true,
          state: {
            feedback: {
              variant: "default" as const,
              title: t("createForm.editSuccessTitle"),
              description: msg,
            },
          },
        })
        return
      }

      setFormAlert({
        variant: "default",
        title: t("createForm.successTitle"),
        description: msg,
      })
      reset(emptyValues)
    } catch (e) {
      setFormAlert({
        variant: "destructive",
        title: isEdit ? t("createForm.editErrorTitle") : t("createForm.errorTitle"),
        description:
          e instanceof Error
            ? e.message
            : isEdit
              ? t("createForm.editErrorFallback")
              : t("createForm.errorFallback"),
      })
    }
  }

  return (
    <div className="mx-auto w-[100%] max-w-full rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-6 shadow-[var(--shadow)] sm:p-8">
      <div className="mb-8 space-y-1">
        <h2 className="text-lg font-semibold text-[var(--text-h)]">
          {isEdit ? t("createForm.editTitle") : t("createForm.title")}
        </h2>
        <p className="text-sm text-[var(--text-muted)]">
          {isEdit ? t("createForm.editLead") : t("createForm.lead")}
        </p>
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
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <FormTextField
              control={control}
              name="company_name"
              label={t("createForm.companyName")}
              placeholder={t("createForm.companyNamePh")}
              rules={{
                required: t("createForm.valRequired"),
                minLength: { value: 2, message: t("createForm.valCompanyMin") },
              }}
            />
          </div>
          <FormTextField
            control={control}
            name="poc_name"
            label={t("createForm.pocName")}
            placeholder={t("createForm.pocNamePh")}
            rules={{ required: t("createForm.valRequired") }}
          />
          <FormTextField
            control={control}
            name="poc_email"
            label={t("createForm.pocEmail")}
            placeholder={t("createForm.pocEmailPh")}
            type="email"
            autoComplete="email"
            rules={{
              required: t("createForm.valRequired"),
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: t("createForm.valEmail"),
              },
            }}
          />
        </div>

        <FormCheckboxField
          control={control}
          name="status_active"
          label={t("createForm.statusLabel")}
          description={t("createForm.statusDescription")}
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
              {isSubmitting
                ? isEdit
                  ? t("createForm.editSubmitting")
                  : t("createForm.submitting")
                : isEdit
                  ? t("createForm.editSubmit")
                  : t("createForm.submit")}
            </span>
          </AnimatedSubmitButton>
          <Link
            to="/companies"
            className="text-center text-sm font-medium text-[var(--brand)] hover:underline sm:text-end"
          >
            {t("createForm.backToList")}
          </Link>
        </div>
      </form>
    </div>
  )
}
