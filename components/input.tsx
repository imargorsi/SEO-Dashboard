"use client";

import { formFieldControlClass } from "@/lib/frontend/layout/dashboard-chrome";
import { cn } from "@/lib/utils";
import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ComponentPropsWithoutRef,
  type FocusEvent,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
} from "react";
import { Icons } from "@/lib/frontend/icons/app-icons";
import { useTranslation } from "react-i18next";
import SelectDropdownArrowIcon from "@/components/icons/input-select-dropdown-arrow";
import { resolveInputStartIcon } from "@/lib/frontend/forms/input-start-icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type InputType =
  | "text"
  | "number"
  | "email"
  | "password"
  | "textarea"
  | "select"
  | "time"
  | "date"
  | "url";

export interface Option {
  label: string;
  value: string | number;
  /** Optional chip/badge shown beside the label in the trigger (when selected) and dropdown rows. */
  badge?: ReactNode;
}

type NativeControlProps = Omit<
  ComponentPropsWithoutRef<"input">,
  "type" | "id" | "name" | "value" | "defaultValue" | "onChange" | "onBlur" | "className"
>;

export interface ReusableInputProps extends NativeControlProps {
  id: string;
  /** Optional when using `{...register("field")}` — register supplies `name`. */
  name?: string;
  label?: string;
  type?: InputType;
  value?: string | number;
  placeholder?: string;
  options?: Option[];
  rows?: number;
  required?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  /** Validation message from RHF: `errors.field?.message` */
  error?: string;
  className?: string;
  /** Merged onto the native control (and chip shell) — use for auth glass surfaces. */
  controlClassName?: string;
  autoComplete?: string;
  /** Renders `value` as a comma-separated list of removable chips instead of plain text. */
  chips?: boolean;
  /** Fired when a `type="select"` dropdown opens or closes. */
  onSelectOpenChange?: (open: boolean) => void;
  /** Optional leading icon inside the control (email / search, etc.). */
  startIcon?: ReactNode;
  onChange?: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onBlur?: (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

function parseChipValues(value: string): string[] {
  return value
    .split(",")
    .map((chip) => chip.trim())
    .filter(Boolean);
}

type ControlElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

function assignRef(node: ControlElement | null, ref: Ref<ControlElement> | undefined) {
  if (!ref) return;
  if (typeof ref === "function") {
    ref(node);
    return;
  }
  ref.current = node;
}

function mergeRefs(
  node: ControlElement | null,
  ...refs: Array<Ref<ControlElement> | undefined>
) {
  refs.forEach((ref) => assignRef(node, ref));
}

type SelectFieldProps = {
  id: string;
  name?: string;
  value?: string | number;
  placeholder?: string;
  options: Option[];
  required: boolean;
  disabled: boolean;
  showError: boolean;
  controlClassName: string;
  onChange?: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onBlur?: (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onOpenChange?: (open: boolean) => void;
  setControlRef: (node: ControlElement | null) => void;
  "aria-label"?: string;
};

function SelectField({
  id,
  name,
  value,
  placeholder,
  options,
  required,
  disabled,
  showError,
  controlClassName,
  onChange,
  onBlur,
  onOpenChange,
  setControlRef,
  "aria-label": ariaLabel,
}: SelectFieldProps) {
  const isControlled = value !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState("");
  const currentValue = String(isControlled ? value : uncontrolledValue);
  const selectableOptions = options.filter((option) => String(option.value) !== "");
  const selected = selectableOptions.find((option) => String(option.value) === currentValue);
  const displayLabel = selected?.label ?? placeholder ?? "";

  useEffect(() => {
    if (!isControlled) return;
    setUncontrolledValue(String(value));
  }, [isControlled, value]);

  function emitChange(next: string) {
    if (!isControlled) setUncontrolledValue(next);
    onChange?.({
      target: { name, value: next },
    } as unknown as ChangeEvent<HTMLSelectElement>);
  }

  return (
    <>
      <input
        id={id}
        name={name}
        type="hidden"
        value={currentValue}
        required={required}
        disabled={disabled}
        aria-invalid={showError}
        aria-describedby={showError ? `${id}-error` : undefined}
        onChange={() => undefined}
        onBlur={(e) => onBlur?.(e as unknown as FocusEvent<HTMLSelectElement>)}
        ref={setControlRef as Ref<HTMLInputElement>}
      />
      <DropdownMenu className="w-full" onOpenChange={onOpenChange}>
        <DropdownMenuTrigger
          id={`${id}-trigger`}
          disabled={disabled}
          aria-label={ariaLabel}
          aria-invalid={showError}
          aria-describedby={showError ? `${id}-error` : undefined}
          className={cn(
            controlClassName,
            "flex w-full items-center justify-between gap-2 pe-3 text-start",
            !selected && "text-text-placeholder",
            disabled && "cursor-not-allowed",
          )}
        >
          <span className="flex min-w-0 flex-1 items-center gap-2">
            <span className="min-w-0 truncate">{displayLabel}</span>
            {selected?.badge}
          </span>
          <SelectDropdownArrowIcon className="shrink-0 text-text-muted" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="top-full mt-2 w-full min-w-full">
          {selectableOptions.length === 0 ? (
            <p className="px-2.5 py-3 text-center type-caption text-text-muted">{placeholder}</p>
          ) : (
            <div className="themed-scrollbar max-h-45 overflow-y-auto">
              {selectableOptions.map((option) => {
                const optionValue = String(option.value);
                const isSelected = optionValue === currentValue;

                return (
                  <DropdownMenuItem
                    key={optionValue}
                    onSelect={() => emitChange(optionValue)}
                    className={cn(isSelected && "bg-brand/12 text-text-primary")}
                  >
                    <span className="flex min-w-0 flex-1 items-center gap-2 text-start">
                      <span className="min-w-0 flex-1 truncate">{option.label}</span>
                      {option.badge}
                    </span>
                    {isSelected ? (
                      <Icons.tick className="size-3.5 shrink-0 text-brand" aria-hidden />
                    ) : null}
                  </DropdownMenuItem>
                );
              })}
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

export const Input = forwardRef<ControlElement, ReusableInputProps>(function Input(props, forwardedRef) {
  const {
    id,
    name,
    label,
    type = "text",
    value,
    placeholder,
    options = [],
    rows = 4,
    required = false,
    readOnly = false,
    disabled = false,
    error = "",
    className = "",
    controlClassName: controlClassNameProp,
    autoComplete,
    chips = false,
    startIcon,
    onSelectOpenChange,
    onChange,
    onBlur,
    "aria-label": ariaLabel,
    ref: registerRef,
    ...rest
  } = props as ReusableInputProps & { ref?: Ref<ControlElement> };

  const isPassword = type === "password";
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [chipDraft, setChipDraft] = useState("");
  const chipInputRef = useRef<HTMLInputElement>(null);
  const inputType = isPassword ? (passwordVisible ? "text" : "password") : type;
  const { t } = useTranslation("translation", { keyPrefix: "form" });
  const resolvedStartIcon = startIcon !== undefined ? startIcon : resolveInputStartIcon(type);
  const hasStartIcon = Boolean(resolvedStartIcon);

  const showError = Boolean(error);
  const baseClasses = cn(
    "type-body w-full rounded-xl bg-transparent px-3 py-2.5 text-text-primary outline-none transition placeholder:text-text-placeholder focus:border-[var(--accent-border)] focus:ring-2 focus:ring-brand/25 disabled:cursor-not-allowed disabled:opacity-60 disabled:text-text-disabled read-only:cursor-default read-only:opacity-80",
    formFieldControlClass,
  );
  const borderClass = showError
    ? "border-[color-mix(in_srgb,var(--destructive)_68%,transparent)]"
    : "";

  const handleBlur = (e: FocusEvent<ControlElement>) => {
    onBlur?.(e);
  };

  const valueProps = value !== undefined ? { value: value as string | number } : {};
  const controlClassName = cn(baseClasses, borderClass, controlClassNameProp);
  const setControlRef = (node: ControlElement | null) => mergeRefs(node, forwardedRef, registerRef, chipInputRef);

  const chipValues = chips ? parseChipValues(typeof value === "string" ? value : "") : [];

  function emitChipsChange(nextChips: string[]) {
    onChange?.({ target: { name, value: nextChips.join(", ") } } as unknown as ChangeEvent<HTMLInputElement>);
  }

  function removeChip(chip: string) {
    emitChipsChange(chipValues.filter((c) => c !== chip));
  }

  function handleChipKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const next = chipDraft.trim();
      setChipDraft("");
      if (!next) return;
      if (chipValues.some((c) => c.toLowerCase() === next.toLowerCase())) return;
      emitChipsChange([...chipValues, next]);
      return;
    }
    if (e.key === "Backspace" && chipDraft === "" && chipValues.length > 0) {
      e.preventDefault();
      emitChipsChange(chipValues.slice(0, -1));
    }
  }

  function handleChipBlur(e: FocusEvent<HTMLInputElement>) {
    const next = chipDraft.trim();
    if (next && !chipValues.some((c) => c.toLowerCase() === next.toLowerCase())) {
      setChipDraft("");
      emitChipsChange([...chipValues, next]);
    }
    handleBlur(e);
  }

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label ? (
        <label
          htmlFor={id}
          className={cn(
            "type-label text-text-primary",
            required ? 'after:ms-0.5 after:text-destructive after:content-["*"]' : "",
            showError ? "text-destructive" : ""
          )}
        >
          {label}
        </label>
      ) : null}

      {chips ? (
        <div
          onClick={() => chipInputRef.current?.focus()}
          className={cn(
            formFieldControlClass,
            "flex w-full flex-wrap items-center gap-1.5 rounded-xl bg-transparent px-2 py-1.5 transition focus-within:border-(--accent-border) focus-within:ring-2 focus-within:ring-brand/25",
            hasStartIcon && "ps-2.5",
            borderClass,
            controlClassNameProp,
            disabled && "cursor-not-allowed opacity-60",
          )}
        >
          {hasStartIcon ? (
            <span className="ms-0.5 flex shrink-0 items-center text-text-muted" aria-hidden>
              {resolvedStartIcon}
            </span>
          ) : null}
          {chipValues.map((chip) => (
            <span
              key={chip}
              className="inline-flex max-w-full items-center gap-1 rounded-2xl border border-brand/45 bg-brand/15 py-1 ps-2.5 pe-1 shadow-(--shadow)"
            >
              <span className="min-w-0 truncate type-body text-text-primary">{chip}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeChip(chip);
                }}
                disabled={disabled}
                className="inline-flex size-5 shrink-0 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-brand/20 hover:text-text-primary disabled:pointer-events-none disabled:opacity-60"
                aria-label={t("removeChip", { value: chip })}
              >
                <Icons.cancel className="size-3.5" aria-hidden />
              </button>
            </span>
          ))}
          <input
            id={id}
            name={name}
            type="text"
            value={chipDraft}
            placeholder={chipValues.length === 0 ? placeholder : undefined}
            required={required && chipValues.length === 0}
            readOnly={readOnly}
            disabled={disabled}
            aria-invalid={showError}
            aria-describedby={showError ? `${id}-error` : undefined}
            onChange={(e) => setChipDraft(e.target.value)}
            onKeyDown={handleChipKeyDown}
            onBlur={handleChipBlur}
            ref={setControlRef}
            className="type-body min-w-24 flex-1 bg-transparent px-1 py-1 text-text-primary outline-none placeholder:text-text-placeholder disabled:cursor-not-allowed"
            autoComplete={autoComplete}
          />
        </div>
      ) : type === "textarea" ? (
        <textarea
          id={id}
          name={name}
          rows={rows}
          placeholder={placeholder}
          required={required}
          readOnly={readOnly}
          disabled={disabled}
          aria-invalid={showError}
          aria-describedby={showError ? `${id}-error` : undefined}
          onChange={onChange}
          onBlur={handleBlur}
          ref={setControlRef}
          className={controlClassName}
          autoComplete={autoComplete}
          {...valueProps}
        />
      ) : type === "select" ? (
        <SelectField
          id={id}
          name={name}
          value={value}
          placeholder={placeholder}
          options={options}
          required={required}
          disabled={disabled || readOnly}
          showError={showError}
          controlClassName={controlClassName}
          onChange={onChange}
          onBlur={onBlur}
          onOpenChange={onSelectOpenChange}
          setControlRef={setControlRef}
          aria-label={ariaLabel ?? (label ? undefined : placeholder)}
        />
      ) : (
        <div className={cn((isPassword || hasStartIcon) && "relative")}>
          {hasStartIcon ? (
            <span
              className="pointer-events-none absolute inset-s-0 inset-y-0 z-10 flex items-center justify-center ps-3 text-text-muted"
              aria-hidden
            >
              {resolvedStartIcon}
            </span>
          ) : null}
          <input
            id={id}
            name={name}
            type={inputType}
            placeholder={placeholder}
            required={required}
            readOnly={readOnly}
            disabled={disabled}
            aria-invalid={showError}
            aria-describedby={showError ? `${id}-error` : undefined}
            onChange={onChange}
            onBlur={handleBlur}
            ref={setControlRef}
            className={cn(
              controlClassName,
              hasStartIcon && "ps-10",
              isPassword && "pe-10",
            )}
            autoComplete={autoComplete}
            {...valueProps}
            {...rest}
          />
          {isPassword ? (
            <button
              type="button"
              onClick={() => setPasswordVisible((visible) => !visible)}
              disabled={disabled}
              aria-label={passwordVisible ? t("hidePassword") : t("showPassword")}
              aria-pressed={passwordVisible}
              className="absolute inset-e-0 inset-y-0 z-10 flex items-center justify-center px-3 text-text-muted transition-colors hover:text-text-primary focus-visible:text-text-primary focus-visible:outline-none disabled:pointer-events-none disabled:opacity-60"
            >
              {passwordVisible ? (
                <Icons.viewOff className="size-4" aria-hidden />
              ) : (
                <Icons.view className="size-4" aria-hidden />
              )}
            </button>
          ) : null}
        </div>
      )}

      {showError ? (
        <p id={`${id}-error`} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
});

Input.displayName = "Input";
