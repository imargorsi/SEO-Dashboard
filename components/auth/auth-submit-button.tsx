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
        "flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[var(--brand)] text-sm font-medium text-white transition-colors",
        "hover:bg-[var(--brand)]/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)]",
        "disabled:pointer-events-none disabled:opacity-60",
        className
      )}
    >
      {children}
    </button>
  );
}
