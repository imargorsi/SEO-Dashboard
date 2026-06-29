import {
  type Control,
  Controller,
  type FieldPath,
  type FieldValues,
  type RegisterOptions,
} from "react-hook-form"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export type CheckboxGroupOption = {
  /** Stored on the form as part of an array. */
  value: number | string
  label: string
  disabled?: boolean
}

type FormCheckboxGroupFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = {
  control: Control<TFieldValues>
  name: TName
  label: string
  description?: string
  options: CheckboxGroupOption[]
  columns?: 1 | 2 | 3 | 4
  rules?: RegisterOptions<TFieldValues, TName>
  emptyText?: string
  loading?: boolean
  loadingText?: string
}

export function FormCheckboxGroupField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  description,
  options,
  columns = 2,
  rules,
  emptyText,
  loading,
  loadingText,
}: FormCheckboxGroupFieldProps<TFieldValues, TName>) {
  const colsClass = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  }[columns]

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field, fieldState }) => {
        const raw: unknown = field.value
        const current: (number | string)[] = Array.isArray(raw)
          ? (raw as (number | string)[])
          : []
        const selected = new Set(current.map((v) => String(v)))

        const toggle = (value: number | string, checked: boolean) => {
          const next = new Set(current.map((v) => String(v)))
          if (checked) next.add(String(value))
          else next.delete(String(value))
          // restore original type (number/string) from options
          const out = options
            .filter((o) => next.has(String(o.value)))
            .map((o) => o.value)
          field.onChange(out)
        }

        return (
          <div className="space-y-2">
            <Label>{label}</Label>
            <div
              className={cn(
                "rounded-xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--social-bg)_38%,var(--bg-elevated))] px-4 py-3 dark:bg-white/[0.03]",
                fieldState.invalid &&
                  "border-[color-mix(in_srgb,var(--destructive)_55%,var(--border))]",
              )}
            >
              {loading ? (
                <p className="py-1.5 text-sm text-[var(--text-muted)]">
                  {loadingText ?? "Loading…"}
                </p>
              ) : options.length === 0 ? (
                <p className="py-1.5 text-sm text-[var(--text-muted)]">
                  {emptyText ?? "No options."}
                </p>
              ) : (
                <div className={cn("grid gap-x-4 gap-y-2.5", colsClass)}>
                  {options.map((opt) => {
                    const id = `cbg-${name}-${String(opt.value).replace(/\W+/g, "-")}`
                    const checked = selected.has(String(opt.value))
                    return (
                      <div key={id} className="flex items-center gap-2">
                        <Checkbox
                          id={id}
                          checked={checked}
                          disabled={opt.disabled}
                          onCheckedChange={(v) => toggle(opt.value, v === true)}
                        />
                        <Label
                          htmlFor={id}
                          className="cursor-pointer text-[13px] font-normal text-[var(--text)]"
                        >
                          {opt.label}
                        </Label>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
            {description ? (
              <p className="text-xs text-[var(--text-muted)]">{description}</p>
            ) : null}
            {fieldState.error?.message ? (
              <p className="text-xs text-destructive" role="alert">
                {fieldState.error.message}
              </p>
            ) : null}
          </div>
        )
      }}
    />
  )
}
