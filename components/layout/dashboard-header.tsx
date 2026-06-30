"use client";

import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { IoLogOutOutline } from "react-icons/io5";
import { useAuthUserQuery, useLogoutMutation } from "@/features/auth/auth.api";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

export function DashboardHeader() {
  const router = useRouter();
  const { t } = useTranslation("translation", { keyPrefix: "userMenu" });
  const { data: user } = useAuthUserQuery();
  const logoutMutation = useLogoutMutation();

  const displayName = user?.name?.trim() || t("fallbackName");

  async function handleLogout() {
    if (logoutMutation.isPending) return;

    try {
      await logoutMutation.mutateAsync();
    } catch {
      /* session is still cleared in onSettled if the server is unreachable */
    }

    router.replace("/");
  }

  return (
    <header className="flex shrink-0 items-center justify-between gap-4 border-b border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3 md:px-6">
      <p className="truncate text-sm font-medium text-[var(--text-h)]">{displayName}</p>

      <button
        type="button"
        onClick={() => void handleLogout()}
        disabled={logoutMutation.isPending}
        aria-busy={logoutMutation.isPending}
        className={cn(
          "inline-flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm font-medium text-[var(--text-h)] transition",
          "hover:bg-[var(--accent-bg)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)]",
          "disabled:pointer-events-none disabled:opacity-60"
        )}
      >
        {logoutMutation.isPending ? (
          <Spinner className="size-4 shrink-0 text-current" aria-hidden />
        ) : (
          <IoLogOutOutline className="size-4 shrink-0" aria-hidden />
        )}
        {t("logOut")}
      </button>
    </header>
  );
}
