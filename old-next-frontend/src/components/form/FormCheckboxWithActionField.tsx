import * as React from "react"
import {
  type Control,
  Controller,
  type FieldPath,
  type FieldValues,
  type RegisterOptions,
} from "react-hook-form"

import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { api } from "@/lib/api"

type FormCheckboxWithActionFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = {
  control: Control<TFieldValues>
  name: TName
  label: string
  description?: string
  rules?: RegisterOptions<TFieldValues, TName>
  /** Shown on the right when the checkbox is checked. */
  actionLabel: string
  /** Dummy or real API path — called via `api.post` when the action button is clicked. */
  actionEndpoint: string
  actionErrorFallback?: string
}

type ActionApiResponse = {
  success?: boolean
  message?: string | null
}

export function FormCheckboxWithActionField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  description,
  rules,
  actionLabel,
  actionEndpoint,
  actionErrorFallback = "Request failed.",
}: FormCheckboxWithActionFieldProps<TFieldValues, TName>) {
  const id = React.useId()
  const [actionLoading, setActionLoading] = React.useState(false)
  const [actionError, setActionError] = React.useState<string | null>(null)

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field, fieldState }) => {
        const checked = Boolean(field.value)

        async function onActionClick() {
          setActionError(null)
          setActionLoading(true)
          try {
            await api.post<ActionApiResponse>(actionEndpoint, {})
          } catch (e) {
            setActionError(
              e instanceof Error ? e.message : actionErrorFallback,
            )
          } finally {
            setActionLoading(false)
          }
        }

        return (
          <div
            className={[
              "flex gap-3 rounded-xl border px-4 py-3.5 shadow-xs transition-colors",
              fieldState.invalid
                ? "border-[color-mix(in_srgb,var(--destructive)_55%,var(--border))]"
                : "border-[var(--border)] bg-[color-mix(in_srgb,var(--social-bg)_38%,var(--bg-elevated))] dark:bg-white/[0.03]",
            ].join(" ")}
          >
            <Checkbox
              id={id}
              checked={checked}
              onCheckedChange={(v) => {
                field.onChange(v === true)
                if (v !== true) setActionError(null)
              }}
              onBlur={field.onBlur}
              ref={field.ref}
              aria-invalid={fieldState.invalid}
              className="mt-0.5"
            />
            <div className="min-w-0 flex-1 space-y-1">
              <Label htmlFor={id} className="cursor-pointer leading-snug">
                {label}
              </Label>
              {description ? (
                <p className="text-xs leading-relaxed text-[var(--text-muted)]">
                  {description}
                </p>
              ) : null}
              {fieldState.error?.message ? (
                <p className="text-xs text-destructive" role="alert">
                  {fieldState.error.message}
                </p>
              ) : null}
              {actionError ? (
                <p className="text-xs text-destructive" role="alert">
                  {actionError}
                </p>
              ) : null}
            </div>
            {checked ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0 self-center"
                disabled={actionLoading}
                aria-busy={actionLoading}
                onClick={() => void onActionClick()}
              >
                {actionLoading ? (
                  <Spinner className="size-3.5" />
                ) : (
                  actionLabel
                )}
              </Button>
            ) : null}
          </div>
        )
      }}
    />
  )
}
