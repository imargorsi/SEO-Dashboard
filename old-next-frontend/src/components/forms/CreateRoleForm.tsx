import { useEffect, useMemo, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { Link, useNavigate } from "react-router-dom"
import useSWR from "swr"
import { AlertCircle, CheckCircle2 } from "lucide-react"

import { FormTextField } from "@/components/form/FormTextField"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button as AnimatedSubmitButton } from "@/components/ui/moving-border"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import {
  postRole,
  putRole,
  type CreateRoleFormValues,
} from "@/lib/admin/createRoleApi"
import {
  ADMIN_PERMISSIONS_ENDPOINT,
  type AdminPermissionsResponse,
} from "@/lib/admin/permissions.types"

const emptyValues: CreateRoleFormValues = {
  name: "",
  permissions: [],
}

type PermissionGroup = {
  key: string
  label: string
  items: { name: string; action: string }[]
}

function buildGroups(names: string[]): PermissionGroup[] {
  const map = new Map<string, PermissionGroup>()
  for (const name of names) {
    const lastDot = name.lastIndexOf(".")
    const prefix = lastDot > -1 ? name.slice(0, lastDot) : ""
    const action = lastDot > -1 ? name.slice(lastDot + 1) : name
    const key = prefix || name
    const label = prefix || name
    if (!map.has(key)) {
      map.set(key, { key, label, items: [] })
    }
    map.get(key)!.items.push({ name, action })
  }
  return Array.from(map.values())
    .map((g) => ({
      ...g,
      items: g.items
        .slice()
        .sort((a, b) => a.action.localeCompare(b.action)),
    }))
    .sort((a, b) => a.label.localeCompare(b.label))
}

type CreateRoleFormProps = {
  roleId?: number
  initialValues?: CreateRoleFormValues
}

export function CreateRoleForm({
  roleId,
  initialValues,
}: CreateRoleFormProps) {
  const isEdit = roleId != null && Number.isFinite(roleId)
  const navigate = useNavigate()
  const { t } = useTranslation("translation", { keyPrefix: "modules.roles" })
  const [formAlert, setFormAlert] = useState<
    | { variant: "default"; title: string; description?: string }
    | { variant: "destructive"; title: string; description?: string }
    | null
  >(null)

  const permKey = useMemo(
    () => [ADMIN_PERMISSIONS_ENDPOINT, { per_page: 100 }] as const,
    [],
  )
  const {
    data: permData,
    error: permError,
    isLoading: permLoading,
  } = useSWR<AdminPermissionsResponse>(permKey)

  const allPermissionNames = useMemo(() => {
    if (!permData?.success) return []
    return permData.data.items.map((p) => p.name)
  }, [permData])

  const groups = useMemo(
    () => buildGroups(allPermissionNames),
    [allPermissionNames],
  )

  const form = useForm<CreateRoleFormValues>({
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

  async function onSubmit(values: CreateRoleFormValues) {
    setFormAlert(null)
    try {
      const payload = {
        name: values.name.trim(),
        permissions: values.permissions,
      }
      const json = isEdit
        ? await putRole(roleId!, payload)
        : await postRole(payload)
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
      navigate("/roles", {
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

        <Controller
          control={control}
          name="permissions"
          render={({ field }) => {
            const selected = new Set(field.value)
            const total = allPermissionNames.length
            const selectedCount = field.value.length
            const allChecked = total > 0 && selectedCount === total

            const togglePerm = (name: string, checked: boolean) => {
              const next = new Set(selected)
              if (checked) next.add(name)
              else next.delete(name)
              field.onChange(Array.from(next))
            }
            const toggleAll = (checked: boolean) => {
              field.onChange(checked ? allPermissionNames.slice() : [])
            }
            const toggleGroup = (group: PermissionGroup, checked: boolean) => {
              const next = new Set(selected)
              for (const it of group.items) {
                if (checked) next.add(it.name)
                else next.delete(it.name)
              }
              field.onChange(Array.from(next))
            }

            return (
              <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--social-bg)_38%,var(--bg-elevated))] dark:bg-white/[0.03]">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--social-bg)_55%,var(--bg-elevated))] px-4 py-2.5 dark:bg-white/[0.04]">
                  <h3 className="text-sm font-semibold text-[var(--text-h)]">
                    {t("createForm.permsHeading")}
                  </h3>
                  <span className="text-[11px] tabular-nums text-[var(--text-muted)]">
                    {t("createForm.permsCount", {
                      selected: selectedCount,
                      total,
                    })}
                  </span>
                </div>

                {permError ? (
                  <div className="px-4 py-4">
                    <Alert variant="destructive">
                      <AlertCircle className="size-4" aria-hidden />
                      <AlertTitle>{t("createForm.permsLoadErrorTitle")}</AlertTitle>
                      <AlertDescription>
                        {permError instanceof Error
                          ? permError.message
                          : t("createForm.permsLoadErrorBody")}
                      </AlertDescription>
                    </Alert>
                  </div>
                ) : permLoading && !permData ? (
                  <div className="flex items-center gap-2 px-4 py-6 text-sm text-[var(--text-muted)]">
                    <Spinner className="size-4 shrink-0" />
                    {t("createForm.permsLoading")}
                  </div>
                ) : groups.length === 0 ? (
                  <div className="px-4 py-6 text-sm text-[var(--text-muted)]">
                    {t("createForm.permsEmpty")}
                  </div>
                ) : (
                  <div className="divide-y divide-[var(--border)]">
                    <label className="flex cursor-pointer items-center gap-2.5 px-4 py-3">
                      <Checkbox
                        checked={allChecked}
                        onCheckedChange={(v) => toggleAll(v === true)}
                        aria-label={t("createForm.permsSelectAll")}
                      />
                      <span className="text-sm font-medium text-[var(--text-h)]">
                        {t("createForm.permsSelectAll")}
                      </span>
                    </label>

                    <div className="space-y-5 px-4 py-4">
                      {groups.map((group) => {
                        const groupChecked = group.items.every((it) =>
                          selected.has(it.name),
                        )
                        return (
                          <div key={group.key} className="space-y-2">
                            <label className="flex w-fit cursor-pointer items-center gap-2">
                              <Checkbox
                                checked={groupChecked}
                                onCheckedChange={(v) =>
                                  toggleGroup(group, v === true)
                                }
                                aria-label={`${t("createForm.permsSelectAll")} — ${group.label}`}
                              />
                              <span className="text-[13px] font-semibold text-[var(--text-h)]">
                                {group.label}
                              </span>
                            </label>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3 lg:grid-cols-4">
                              {group.items.map((item) => {
                                const id = `perm-${item.name.replace(/\W+/g, "-")}`
                                const checked = selected.has(item.name)
                                return (
                                  <div
                                    key={item.name}
                                    className="flex items-center gap-2"
                                  >
                                    <Checkbox
                                      id={id}
                                      checked={checked}
                                      onCheckedChange={(v) =>
                                        togglePerm(item.name, v === true)
                                      }
                                    />
                                    <Label
                                      htmlFor={id}
                                      className="cursor-pointer text-[13px] font-normal text-[var(--text)]"
                                    >
                                      {item.action}
                                    </Label>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
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
            to="/roles"
            className="text-center text-sm font-medium text-[var(--brand)] hover:underline sm:text-end"
          >
            {t("createForm.backToList")}
          </Link>
        </div>
      </form>
    </div>
  )
}
