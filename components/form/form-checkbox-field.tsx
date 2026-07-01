"use client";

import * as React from "react";
import {
  type Control,
  Controller,
  type FieldPath,
  type FieldValues,
  type RegisterOptions,
} from "react-hook-form";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

type FormCheckboxFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = {
  control: Control<TFieldValues>;
  name: TName;
  label: string;
  description?: string;
  rules?: RegisterOptions<TFieldValues, TName>;
};

export function FormCheckboxField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({ control, name, label, description, rules }: FormCheckboxFieldProps<TFieldValues, TName>) {
  const id = React.useId();
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field, fieldState }) => (
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
            checked={Boolean(field.value)}
            onChange={(e) => field.onChange(e.target.checked)}
            onBlur={field.onBlur}
            ref={field.ref}
            aria-invalid={fieldState.invalid}
          />
          <div className="min-w-0 flex-1 space-y-1">
            <Label htmlFor={id} className="cursor-pointer leading-snug">
              {label}
            </Label>
            {description ? (
              <p className="text-xs leading-relaxed text-[var(--text-muted)]">{description}</p>
            ) : null}
            {fieldState.error?.message ? (
              <p className="text-xs text-destructive" role="alert">
                {fieldState.error.message}
              </p>
            ) : null}
          </div>
        </div>
      )}
    />
  );
}
