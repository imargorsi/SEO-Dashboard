import * as React from "react"
import {
  type Control,
  Controller,
  type FieldPath,
  type FieldValues,
  type RegisterOptions,
} from "react-hook-form"
import { useTranslation } from "react-i18next"
import { Eye, EyeOff } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type FormTextFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = {
  control: Control<TFieldValues>
  name: TName
  label: string
  placeholder?: string
  type?: React.HTMLInputTypeAttribute
  autoComplete?: string
  rules?: RegisterOptions<TFieldValues, TName>
}

export function FormTextField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  placeholder,
  type = "text",
  autoComplete = "off",
  rules,
}: FormTextFieldProps<TFieldValues, TName>) {
  const id = React.useId()
  const isPassword = type === "password"
  const [revealed, setRevealed] = React.useState(false)
  const inputType = isPassword ? (revealed ? "text" : "password") : type
  const { t } = useTranslation("translation", { keyPrefix: "form" })

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field, fieldState }) => (
        <div className="space-y-2">
          <Label htmlFor={id}>{label}</Label>
          <div className="relative">
            <Input
              id={id}
              type={inputType}
              placeholder={placeholder}
              autoComplete={autoComplete}
              {...field}
              className={cn(isPassword && "pe-10")}
              aria-invalid={fieldState.invalid}
            />
            {isPassword ? (
              <button
                type="button"
                onClick={() => setRevealed((v) => !v)}
                aria-label={
                  revealed ? t("hidePassword") : t("showPassword")
                }
                aria-pressed={revealed}
                tabIndex={-1}
                className="absolute inset-y-0 end-0 flex items-center justify-center px-3 text-[var(--text-muted)] transition-colors hover:text-[var(--text-h)] focus-visible:text-[var(--text-h)] focus-visible:outline-none"
              >
                {revealed ? (
                  <EyeOff className="size-4" aria-hidden />
                ) : (
                  <Eye className="size-4" aria-hidden />
                )}
              </button>
            ) : null}
          </div>
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
