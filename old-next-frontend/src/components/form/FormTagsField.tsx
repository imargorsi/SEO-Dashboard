import * as React from "react"
import {
  type Control,
  Controller,
  type FieldPath,
  type FieldValues,
  type RegisterOptions,
} from "react-hook-form"
import { X } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type FormTagsFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = {
  control: Control<TFieldValues>
  name: TName
  label: string
  placeholder?: string
  description?: string
  removeLabel?: string
  rules?: RegisterOptions<TFieldValues, TName>
}

/**
 * Tag / chip multi-add input. Stores `string[]` on the form.
 * - Press Enter or `,` to commit the current draft.
 * - Backspace on empty draft removes the last tag.
 */
export function FormTagsField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  placeholder,
  description,
  removeLabel = "Remove",
  rules,
}: FormTagsFieldProps<TFieldValues, TName>) {
  const id = React.useId()
  const [draft, setDraft] = React.useState("")

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field, fieldState }) => {
        const values: string[] = Array.isArray(field.value)
          ? (field.value as string[])
          : []

        const commit = (raw: string) => {
          const next = raw.trim()
          if (!next) return
          if (values.includes(next)) {
            setDraft("")
            return
          }
          field.onChange([...values, next])
          setDraft("")
        }

        const remove = (idx: number) => {
          const next = values.slice()
          next.splice(idx, 1)
          field.onChange(next)
        }

        return (
          <div className="space-y-2">
            <Label htmlFor={id}>{label}</Label>
            <div
              className={cn(
                "flex flex-wrap gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-2 py-1.5 shadow-xs transition-[color,box-shadow,border-color] focus-within:border-[var(--accent-border)] focus-within:ring-2 focus-within:ring-[var(--brand)]/25",
                fieldState.invalid &&
                  "border-[color-mix(in_srgb,var(--destructive)_65%,var(--border))]",
              )}
            >
              {values.map((tag, idx) => (
                <span
                  key={`${tag}-${idx}`}
                  className="inline-flex items-center gap-1 rounded-md border border-[var(--border)] bg-[color-mix(in_srgb,var(--social-bg)_55%,var(--bg-elevated))] px-2 py-0.5 text-xs font-medium text-[var(--text-h)] dark:bg-white/[0.06]"
                >
                  <span className="max-w-[14rem] truncate">{tag}</span>
                  <button
                    type="button"
                    onClick={() => remove(idx)}
                    aria-label={`${removeLabel}: ${tag}`}
                    className="-me-0.5 inline-flex size-4 items-center justify-center rounded text-[var(--text-muted)] transition-colors hover:bg-[var(--accent-bg)] hover:text-[var(--text-h)]"
                  >
                    <X className="size-3" aria-hidden />
                  </button>
                </span>
              ))}
              <Input
                id={id}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault()
                    commit(draft)
                  } else if (e.key === "Backspace" && !draft && values.length) {
                    e.preventDefault()
                    remove(values.length - 1)
                  }
                }}
                onBlur={(e) => {
                  if (draft.trim()) commit(draft)
                  field.onBlur()
                  void e
                }}
                placeholder={values.length === 0 ? placeholder : undefined}
                className="h-7 flex-1 min-w-[8rem] border-0 bg-transparent px-1 shadow-none focus-visible:ring-0"
              />
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
