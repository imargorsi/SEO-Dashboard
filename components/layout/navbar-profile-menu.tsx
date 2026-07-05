"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { IoAlertCircle, IoCheckmarkCircle, IoChevronDown, IoLogOutOutline, IoPersonCircle } from "react-icons/io5";

import { SidebarUserAvatar } from "@/components/layout/sidebar-user-avatar";
import { Spinner } from "@/components/ui/spinner";
import { useAuthUserQuery, useLogoutMutation, useResendEmailVerificationMutation } from "@/features/auth/auth.api";
import { ApiError } from "@/lib/frontend/api/errors";
import { notify } from "@/lib/frontend/feedback/notify";
import { cn } from "@/lib/utils";

const menuItemClass =
  "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-start text-sm font-medium text-[var(--text-h)] transition hover:bg-[var(--accent-bg)]";

function formatRolesForDisplay(roles: string[]): string {
  if (roles.length === 0) return "";
  return roles.map((r) => r.replace(/_/g, " ")).join(" · ");
}

export function NavbarProfileMenu() {
  const { t } = useTranslation("translation", { keyPrefix: "userMenu" });
  const { t: tVerification } = useTranslation("translation", { keyPrefix: "auth.verification" });
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const { data: user } = useAuthUserQuery();
  const logoutMutation = useLogoutMutation();
  const resendMutation = useResendEmailVerificationMutation();

  const displayName = user?.name?.trim() || t("fallbackName");
  const email = user?.email?.trim() || "";
  const verified = Boolean(user?.email_verified_at);
  const roleLine = user ? formatRolesForDisplay(user.roles) : "";
  const isProfileActive = pathname === "/edit-profile" || pathname.startsWith("/edit-profile/");

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      const el = rootRef.current;
      if (el && !el.contains(e.target as Node)) close();
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

  async function onLogout() {
    if (logoutMutation.isPending) return;
    try {
      await logoutMutation.mutateAsync();
    } catch {
      /* session cleared in onSettled */
    } finally {
      close();
      router.replace("/");
    }
  }

  async function onResendVerification() {
    if (resendMutation.isPending || verified) return;

    try {
      const result = await resendMutation.mutateAsync();
      notify.success(result.message?.trim() || tVerification("resendSuccess"));
    } catch (error) {
      notify.error(ApiError.messageFrom(error, tVerification("resendErrorFallback")));
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className={cn(
          "inline-flex h-9 items-center gap-2 rounded-lg px-1.5 pe-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-border)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated)]",
          isProfileActive || open
            ? "bg-[var(--accent-bg)] text-[var(--text-h)]"
            : "bg-transparent text-[var(--text-h)] hover:bg-[var(--accent-bg)]"
        )}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={t("openMenu")}
        onClick={() => setOpen((v) => !v)}
      >
        <SidebarUserAvatar name={displayName} imageUrl={user?.profile_image ?? null} verified={verified} size="sm" />
        <span className="hidden max-w-[7rem] truncate text-xs font-medium text-[var(--text-h)] sm:inline">
          {displayName}
        </span>
        <IoChevronDown
          className={cn("size-3.5 shrink-0 text-[var(--text-muted)] transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </button>

      {open ? (
        <div
          className="absolute end-0 top-full z-50 mt-3 w-60 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] shadow-[var(--shadow)]"
          role="menu"
          aria-label={t("menuLabel")}
        >
          <div className="border-b border-[var(--border)] px-3 py-3">
            <div className="flex items-center gap-2.5">
              <SidebarUserAvatar
                name={displayName}
                imageUrl={user?.profile_image ?? null}
                verified={verified}
                size="sm"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[var(--text-h)]">{displayName}</p>
                {email ? (
                  <p className="truncate text-xs text-[var(--text-muted)]">{email}</p>
                ) : (
                  <p className="truncate text-xs text-[var(--text-muted)]">{t("noEmail")}</p>
                )}
                {roleLine ? (
                  <p className="truncate text-[11px] font-medium capitalize text-[var(--text-muted)]">{roleLine}</p>
                ) : null}
              </div>
            </div>
          </div>

          {verified ? (
            <div className="flex items-center gap-2 border-b border-[var(--border)] px-3 py-2.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <IoCheckmarkCircle className="size-4 shrink-0" aria-hidden />
              <span>{t("emailVerified")}</span>
            </div>
          ) : (
            <button
              type="button"
              disabled={resendMutation.isPending}
              aria-busy={resendMutation.isPending}
              className="flex w-full items-start gap-2 border-b border-[var(--border)] px-3 py-2.5 text-start transition hover:bg-amber-500/10 disabled:opacity-70"
              onClick={() => void onResendVerification()}
            >
              {resendMutation.isPending ? (
                <Spinner className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
              ) : (
                <IoAlertCircle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
              )}
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-medium text-amber-700 dark:text-amber-300">{t("emailNotVerified")}</span>
                <span className="mt-0.5 block text-[11px] text-[var(--text-muted)]">{t("resendVerification")}</span>
              </span>
            </button>
          )}

          <div className="p-1.5" role="none">
            <Link href="/edit-profile" role="menuitem" className={menuItemClass} onClick={close}>
              <IoPersonCircle className="size-4 shrink-0 opacity-80" aria-hidden />
              {t("editProfile")}
            </Link>
            <button
              type="button"
              role="menuitem"
              disabled={logoutMutation.isPending}
              aria-busy={logoutMutation.isPending}
              className={cn(
                menuItemClass,
                "text-[var(--destructive-muted)]",
                logoutMutation.isPending && "pointer-events-none opacity-90"
              )}
              onClick={() => void onLogout()}
            >
              {logoutMutation.isPending ? (
                <Spinner className="size-4 shrink-0 text-current" aria-hidden />
              ) : (
                <IoLogOutOutline className="size-4 shrink-0 opacity-90" aria-hidden />
              )}
              {t("logOut")}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
