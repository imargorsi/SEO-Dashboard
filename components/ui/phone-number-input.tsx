"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import SelectDropdownArrowIcon from "@/components/icons/input-select-dropdown-arrow";
import { formFieldControlClass } from "@/lib/frontend/layout/dashboard-chrome";
import { COUNTRY_DIAL_CODES, DEFAULT_COUNTRY_DIAL_CODE, type TCountryDialCode } from "@/lib/frontend/phone/country-codes";
import { cn } from "@/lib/utils";

type PhoneNumberInputProps = {
  id: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  className?: string;
};

function matchCountry(value: string): TCountryDialCode | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  return COUNTRY_DIAL_CODES.find((country) => trimmed.startsWith(country.dialCode)) ?? null;
}

function splitNumber(value: string, country: TCountryDialCode): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (!trimmed.startsWith(country.dialCode)) return trimmed;
  return trimmed.slice(country.dialCode.length).trim();
}

function flagClass(code: string) {
  return `fi-${code.toLowerCase()}`;
}

/** Mounted only while the dropdown is open, so its search state resets every time it reopens. */
function CountryOptionList({
  onSelect,
}: {
  onSelect: (country: TCountryDialCode) => void;
}) {
  const { t } = useTranslation("translation", { keyPrefix: "form" });
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRY_DIAL_CODES;
    return COUNTRY_DIAL_CODES.filter(
      (country) =>
        country.name.toLowerCase().includes(q) ||
        country.dialCode.includes(q) ||
        country.code.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <>
      <div className="p-1 pb-1.5">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("searchCountry")}
          autoFocus
          className="type-caption w-full rounded-lg border border-border bg-bg-input px-2.5 py-1.5 text-text-primary outline-none placeholder:text-text-placeholder focus:border-[var(--accent-border)]"
        />
      </div>
      <div className="themed-scrollbar max-h-45 overflow-y-auto pe-0.5">
        {filtered.length === 0 ? (
          <p className="px-2.5 py-3 text-center type-caption text-text-muted">{t("noCountriesFound")}</p>
        ) : (
          filtered.map((option) => (
            <DropdownMenuItem key={option.code} onSelect={() => onSelect(option)} className="h-9 gap-2">
              <span className={cn("fi", flagClass(option.code), "shrink-0 rounded-xs text-base")} aria-hidden />
              <span className="flex-1 truncate text-start">{option.name}</span>
              <span className="text-text-muted">{option.dialCode}</span>
            </DropdownMenuItem>
          ))
        )}
      </div>
    </>
  );
}

export function PhoneNumberInput({
  id,
  label,
  placeholder,
  required = false,
  error = "",
  value,
  onChange,
  onBlur,
  className,
}: PhoneNumberInputProps) {
  const [country, setCountry] = useState<TCountryDialCode>(
    () => matchCountry(value ?? "") ?? DEFAULT_COUNTRY_DIAL_CODE,
  );
  const number = splitNumber(value ?? "", country);
  const showError = Boolean(error);

  useEffect(() => {
    const matched = matchCountry(value ?? "");
    if (matched) setCountry(matched);
  }, [value]);

  const controlClasses = cn(
    "type-body rounded-xl bg-transparent px-3 py-2.5 text-text-primary outline-none transition placeholder:text-text-placeholder focus:border-[var(--accent-border)] focus:ring-2 focus:ring-brand/25",
    formFieldControlClass,
  );
  const borderClass = showError
    ? "border-[color-mix(in_srgb,var(--destructive)_68%,transparent)]"
    : "";

  function emit(nextCountry: TCountryDialCode, nextNumber: string) {
    onChange(nextNumber ? `${nextCountry.dialCode} ${nextNumber}` : "");
  }

  function handleCountrySelect(next: TCountryDialCode) {
    setCountry(next);
    emit(next, number);
  }

  function handleNumberChange(nextNumber: string) {
    emit(country, nextNumber);
  }

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label ? (
        <label
          htmlFor={id}
          className={cn(
            "type-label text-text-primary",
            required ? 'after:ms-0.5 after:text-destructive after:content-["*"]' : "",
            showError ? "text-destructive" : "",
          )}
        >
          {label}
        </label>
      ) : null}
      <div className="flex gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              controlClasses,
              borderClass,
              "flex w-auto shrink-0 items-center gap-1.5 whitespace-nowrap",
            )}
          >
            <span className={cn("fi", flagClass(country.code), "shrink-0 rounded-xs text-base")} aria-hidden />
            <span>{country.dialCode}</span>
            <SelectDropdownArrowIcon className="shrink-0 text-text-muted" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="top-full mt-2 w-72 p-1">
            <CountryOptionList onSelect={handleCountrySelect} />
          </DropdownMenuContent>
        </DropdownMenu>
        <input
          id={id}
          type="tel"
          value={number}
          placeholder={placeholder}
          required={required}
          onChange={(e) => handleNumberChange(e.target.value)}
          onBlur={onBlur}
          aria-invalid={showError}
          aria-describedby={showError ? `${id}-error` : undefined}
          className={cn(controlClasses, borderClass, "w-full flex-1")}
        />
      </div>
      {showError ? (
        <p id={`${id}-error`} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
