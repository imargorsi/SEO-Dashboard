"use client";

import { cn } from "@/lib/utils";
import {
  forwardRef,
  useEffect,
  useState,
  type FocusEvent,
  type ChangeEvent,
  type Ref,
  type ChangeEventHandler,
} from "react";
import SelectDropdownArrowIcon from "@/components/icons/input-select-dropdown-arrow";

export type InputType = "text" | "number" | "email" | "password" | "textarea" | "select";

export interface Option {
  label: string;
  value: string | number;
}

export interface ReusableInputProps {
  id: string;
  name: string;
  label?: string;
  type?: InputType;
  value?: string | number;
  placeholder?: string;
  options?: Option[];
  rows?: number;
  required?: boolean;
  error?: string;
  className?: string;
  autoComplete?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onBlur?: (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

export const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, ReusableInputProps>(
  function Input(
    {
      id,
      name,
      label,
      type = "text",
      value,
      placeholder,
      options = [],
      rows = 4,
      required = false,
      error = "",
      className = "",
      autoComplete,
      onChange,
      onBlur,
    },
    ref
  ) {
    const [touched, setTouched] = useState(false);
    useEffect(() => {
      if (error) setTouched(true);
    }, [error]);

    const showError = touched && !!error;
    const baseClasses =
      "w-full rounded-lg border bg-[var(--bg)] px-3 py-2.5 text-[var(--text-h)] outline-none transition placeholder:text-[var(--text)]/60 focus:border-[var(--accent-border)] focus:ring-2 focus:ring-[var(--brand)]/25";
    const borderClass = showError
      ? "border-[color-mix(in_srgb,var(--destructive)_68%,transparent)]"
      : "border-[var(--border)]";

    const handleBlur = (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setTouched(true);
      onBlur?.(e);
    };

    const valueProps = value !== undefined ? { value: value as string | number } : {};

    const controlClassName = cn(baseClasses, borderClass);

    return (
      <div className={cn("flex flex-col gap-1.5", className)}>
        {label ? (
          <label
            htmlFor={id}
            className={cn(
              "text-sm font-medium text-[var(--text-h)]",
              required ? 'after:ms-0.5 after:text-[var(--destructive)] after:content-["*"]' : "",
              showError ? "text-[var(--destructive)]" : ""
            )}
          >
            {label}
          </label>
        ) : null}

        {type === "textarea" ? (
          <textarea
            id={id}
            name={name}
            rows={rows}
            placeholder={placeholder}
            required={required}
            aria-invalid={showError}
            aria-describedby={showError ? `${id}-error` : undefined}
            onChange={onChange}
            onBlur={handleBlur}
            ref={ref as Ref<HTMLTextAreaElement>}
            className={controlClassName}
            autoComplete={autoComplete}
            {...valueProps}
          />
        ) : type === "select" ? (
          <div className="relative">
            <select
              id={id}
              name={name}
              required={required}
              aria-invalid={showError}
              aria-describedby={showError ? `${id}-error` : undefined}
              onChange={onChange as ChangeEventHandler<HTMLSelectElement>}
              onBlur={handleBlur}
              ref={ref as Ref<HTMLSelectElement>}
              className={cn(
                controlClassName,
                "appearance-none bg-[var(--bg)] pe-10",
                value === "" ? "text-[var(--text)]/60" : ""
              )}
              {...valueProps}
            >
              <option value="" disabled>
                {placeholder || "Select an option"}
              </option>
              {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2">
              <SelectDropdownArrowIcon />
            </span>
          </div>
        ) : (
          <input
            id={id}
            name={name}
            type={type}
            placeholder={placeholder}
            required={required}
            aria-invalid={showError}
            aria-describedby={showError ? `${id}-error` : undefined}
            onChange={onChange}
            onBlur={handleBlur}
            ref={ref as Ref<HTMLInputElement>}
            className={controlClassName}
            autoComplete={autoComplete}
            {...valueProps}
          />
        )}

        {showError ? (
          <p id={`${id}-error`} className="text-sm text-[var(--destructive)]" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
