"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { IoClose } from "react-icons/io5";

import { cn } from "@/lib/utils";

type SheetContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const SheetContext = React.createContext<SheetContextValue | null>(null);

function useSheet() {
  const ctx = React.useContext(SheetContext);
  if (!ctx) throw new Error("Sheet components must be used within Sheet");
  return ctx;
}

function Sheet({
  open,
  onOpenChange,
  children,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isControlled = open !== undefined;
  const currentOpen = isControlled ? open : internalOpen;

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!isControlled) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange]
  );

  return (
    <SheetContext.Provider value={{ open: Boolean(currentOpen), setOpen }}>{children}</SheetContext.Provider>
  );
}

function SheetContent({
  side = "right",
  className,
  children,
}: React.ComponentProps<"div"> & { side?: "right" | "left" }) {
  const { open, setOpen } = useSheet();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, setOpen]);

  if (!mounted || !open) return null;

  const sideClass =
    side === "left"
      ? "inset-y-0 left-0 border-e"
      : "inset-y-0 right-0 border-s";

  return createPortal(
    <>
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[1px]" aria-hidden onClick={() => setOpen(false)} />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "fixed z-50 flex h-full w-[min(100%,24rem)] flex-col gap-0 border-[var(--border)] bg-[var(--bg-elevated)] shadow-[var(--shadow)] sm:max-w-md",
          sideClass,
          className
        )}
      >
        {children}
        <button
          type="button"
          className="absolute end-3 top-3 rounded-md p-1.5 text-[var(--text-muted)] opacity-80 outline-none transition-opacity hover:bg-[var(--accent-bg)] hover:text-[var(--text-h)] hover:opacity-100 focus-visible:ring-2 focus-visible:ring-[var(--accent-border)]"
          onClick={() => setOpen(false)}
        >
          <IoClose className="size-4" aria-hidden />
          <span className="sr-only">Close</span>
        </button>
      </div>
    </>,
    document.body
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--social-bg)_40%,var(--bg-elevated))] px-5 py-4 pe-12 text-start dark:bg-white/[0.04]",
        className
      )}
      {...props}
    />
  );
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "mt-auto flex flex-col gap-2 border-t border-[var(--border)] px-5 py-4 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  );
}

function SheetTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return <h2 className={cn("text-base font-semibold text-[var(--text-h)]", className)} {...props} />;
}

function SheetDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("text-xs text-[var(--text-muted)]", className)} {...props} />;
}

const SheetTrigger = () => null;
const SheetClose = () => null;
const SheetPortal = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const SheetOverlay = () => null;

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
