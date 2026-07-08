import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type AuthSubmitButtonProps = {
  children: ReactNode;
  disabled?: boolean;
  className?: string;
  type?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
  onClick?: ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
};

export function AuthSubmitButton({
  children,
  disabled,
  className,
  type = "submit",
  onClick,
}: AuthSubmitButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      aria-busy={disabled}
      onClick={onClick}
      className={cn(
        "flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-button text-sm font-semibold text-text-on-brand transition-[filter,background-image]",
        "hover:bg-gradient-button-hover hover:brightness-105",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
        "disabled:pointer-events-none disabled:bg-none disabled:bg-[var(--btn-disabled-bg)] disabled:text-[var(--btn-disabled-fg)] disabled:opacity-100",
        className
      )}
    >
      {children}
    </button>
  );
}
