import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { Link, useNavigate } from "react-router-dom"
import { AlertCircle, CheckCircle2 } from "lucide-react"

import { FormTextField } from "@/components/form/FormTextField"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button as AnimatedSubmitButton } from "@/components/ui/moving-border"
import { Spinner } from "@/components/ui/spinner"
import {
  postPermission,
  putPermission,
  type CreatePermissionFormValues,
} from "@/lib/admin/createPermissionApi"

const emptyValues: CreatePermissionFormValues = {
  name: "",
}

type CreatePermissionFormProps = {
  permissionId?: number
  initialValues?: CreatePermissionFormValues
}

export function CreatePermissionForm({
  permissionId,
  initialValues,
}: CreatePermissionFormProps) {
  const isEdit = permissionId != null && Number.isFinite(permissionId)
  const navigate = useNavigate()
  const { t } = useTranslation("translation", {
    keyPrefix: "modules.permissions",
  })
  const [formAlert, setFormAlert] = useState<
    | { variant: "default"; title: string; description?: string }
    | { variant: "destructive"; title: string; description?: string }
    | null
  >(null)

  const form = useForm<CreatePermissionFormValues>({
    defaultValues: initialValues ?? emptyValues,
    mode: "onSubmit",
  })

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = form

  useEffect(() => {
    if (initialValues) {
      reset(initialValues)
    }
  }, [initialValues, reset])

  async function onSubmit(values: CreatePermissionFormValues) {
    setFormAlert(null)
    try {
      const payload = { name: values.name.trim() }
      const json = isEdit
        ? await putPermission(permissionId!, payload)
        : await postPermission(payload)
      const apiMsg =
        typeof json.message === "string" && json.message.trim()
          ? json.message.trim()
          : null

      if (!json.success) {
        setFormAlert({
          variant: "destructive",
          title: isEdit
            ? t("createForm.editErrorTitle")
            : t("createForm.errorTitle"),
          description:
            apiMsg ??
            (isEdit
              ? t("createForm.editErrorFallback")
              : t("createForm.errorFallback")),
        })
        return
      }

      navigate("/permissions", {
        replace: true,
        state: {
          feedback: {
            variant: "default" as const,
            title: isEdit
              ? t("createForm.editSuccessTitle")
              : t("createForm.successTitle"),
            description:
              apiMsg ??
              (isEdit
                ? t("createForm.editSuccessFallback")
                : t("createForm.successFallback")),
          },
        },
      })
    } catch (e) {
      setFormAlert({
        variant: "destructive",
        title: isEdit
          ? t("createForm.editErrorTitle")
          : t("createForm.errorTitle"),
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
        <FormTextField
          control={control}
          name="name"
          label={t("createForm.name")}
          placeholder={t("createForm.namePh")}
          rules={{
            required: t("createForm.valRequired"),
            minLength: { value: 2, message: t("createForm.valMin") },
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
            to="/permissions"
            className="text-center text-sm font-medium text-[var(--brand)] hover:underline sm:text-end"
          >
            {t("createForm.backToList")}
          </Link>
        </div>
      </form>
    </div>
  )
}
