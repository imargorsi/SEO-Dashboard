"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type DropdownMenuContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  rootRef: React.RefObject<HTMLDivElement | null>;
};

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | null>(null);

function useDropdownMenu() {
  const ctx = React.useContext(DropdownMenuContext);
  if (!ctx) throw new Error("DropdownMenu components must be used within DropdownMenu");
  return ctx;
}

function DropdownMenu({
  children,
  className,
  open: openProp,
  onOpenChange,
}: {
  children: React.ReactNode;
  className?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const isControlled = openProp !== undefined;
  const open = isControlled ? Boolean(openProp) : uncontrolledOpen;
  const rootRef = React.useRef<HTMLDivElement>(null);

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  React.useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      const el = rootRef.current;
      if (el && !el.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, setOpen]);

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen, rootRef }}>
      <div ref={rootRef} className={cn("relative inline-flex", open && "z-50", className)}>
        {children}
      </div>
    </DropdownMenuContext.Provider>
  );
}

function DropdownMenuTrigger({
  children,
  asChild,
  ...props
}: React.ComponentProps<"button"> & { asChild?: boolean }) {
  const { open, setOpen } = useDropdownMenu();

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<{ onClick?: () => void }>, {
      onClick: () => setOpen(!open),
    });
  }

  return (
    <button type="button" aria-expanded={open} onClick={() => setOpen(!open)} {...props}>
      {children}
    </button>
  );
}

function DropdownMenuContent({
  className,
  align = "start",
  children,
  ...props
}: React.ComponentProps<"div"> & { align?: "start" | "end" }) {
  const { open } = useDropdownMenu();
  if (!open) return null;

  return (
    <div
      role="menu"
      data-slot="dropdown-menu-content"
      className={cn(
        // Gap between items is baked in so hover pills never sit flush (works for nested scroll wrappers too).
        "absolute top-full z-50 mt-1.5 min-w-[10rem] overflow-hidden rounded-xl border border-border/50 bg-bg-card p-1.5 text-text-primary shadow-(--shadow-elevated)",
        "[&_[role=menuitem]+[role=menuitem]]:mt-1.5",
        align === "end" ? "end-0" : "start-0",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function DropdownMenuItem({
  className,
  variant = "default",
  onSelect,
  onClick,
  ...props
}: React.ComponentProps<"button"> & {
  variant?: "default" | "destructive";
  onSelect?: () => void;
}) {
  const { setOpen } = useDropdownMenu();

  return (
    <button
      type="button"
      role="menuitem"
      data-variant={variant}
      className={cn(
        "relative flex min-h-9 w-full cursor-default items-center gap-2 rounded-lg px-2.5 py-2 text-start type-body outline-none select-none",
        "hover:bg-bg-hover focus:bg-bg-hover",
        variant === "destructive" && "text-destructive hover:bg-destructive/10 focus:bg-destructive/10",
        className
      )}
      onClick={(e) => {
        onClick?.(e);
        onSelect?.();
        setOpen(false);
      }}
      {...props}
    />
  );
}

const DropdownMenuSeparator = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div
    role="separator"
    className={cn("-mx-0.5 my-1.5 h-px bg-border/60", className)}
    {...props}
  />
);

const DropdownMenuGroup = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const DropdownMenuPortal = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const DropdownMenuSub = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const DropdownMenuSubContent = DropdownMenuContent;
const DropdownMenuSubTrigger = DropdownMenuTrigger;
const DropdownMenuRadioGroup = ({ children }: { children: React.ReactNode }) => <>{children}</>;

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
};
