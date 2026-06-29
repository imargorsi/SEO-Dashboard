import * as React from "react"
import {
  type Control,
  Controller,
  type FieldPath,
  type FieldValues,
  type RegisterOptions,
} from "react-hook-form"

import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type FormTextareaFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = {
  control: Control<TFieldValues>
  name: TName
  label: string
  placeholder?: string
  description?: string
  rows?: number
  rules?: RegisterOptions<TFieldValues, TName>
}

export function FormTextareaField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  placeholder,
  description,
  rows = 4,
  rules,
}: FormTextareaFieldProps<TFieldValues, TName>) {
  const id = React.useId()
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field, fieldState }) => (
        <div className="space-y-2">
          <Label htmlFor={id}>{label}</Label>
          <Textarea
            id={id}
            rows={rows}
            placeholder={placeholder}
            {...field}
            aria-invalid={fieldState.invalid}
          />
          {description ? (
            <p className="text-xs text-[var(--text-muted)]">{description}</p>
          ) : null}
          {fieldState.error?.message ? (
            <p className="text-xs text-destructive" role="alert">
              {fieldState.error.message}
            </p>
          ) : null}
        </div>
      )}
    />
  )
}
