"use client";

import { Spinner } from "@/components/ui/spinner";

export function AuthSessionLoading() {
  return (
    <div className="flex min-h-svh flex-1 items-center justify-center bg-[var(--bg)]" role="status" aria-live="polite">
      <Spinner className="size-8 text-[var(--brand)]" />
    </div>
  );
}
