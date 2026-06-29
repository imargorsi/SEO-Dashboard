import * as React from "react"
import {
  type Control,
  Controller,
  type FieldPath,
  type FieldValues,
  type RegisterOptions,
} from "react-hook-form"

import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export type FormSelectOption = {
  value: string
  label: string
  disabled?: boolean
}

type FormSelectFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = {
  control: Control<TFieldValues>
  name: TName
  label: string
  placeholder?: string
  description?: string
  options: FormSelectOption[]
  disabled?: boolean
  rules?: RegisterOptions<TFieldValues, TName>
}

export function FormSelectField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  placeholder,
  description,
  options,
  disabled,
  rules,
}: FormSelectFieldProps<TFieldValues, TName>) {
  const id = React.useId()
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field, fieldState }) => {
        const stringValue =
          field.value == null || field.value === "" ? "" : String(field.value)
        return (
          <div className="space-y-2">
            <Label htmlFor={id}>{label}</Label>
            <Select
              value={stringValue || undefined}
              onValueChange={(v) => field.onChange(v)}
              disabled={disabled}
            >
              <SelectTrigger
                id={id}
                aria-invalid={fieldState.invalid}
                onBlur={field.onBlur}
              >
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {options.map((opt) => (
                  <SelectItem
                    key={opt.value}
                    value={opt.value}
                    disabled={opt.disabled}
                  >
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
