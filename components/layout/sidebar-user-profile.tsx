"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { IoEllipsisVertical, IoKey, IoLogOutOutline, IoPersonCircle } from "react-icons/io5";

import { SidebarUserAvatar } from "@/components/layout/sidebar-user-avatar";
import { Spinner } from "@/components/ui/spinner";
import { useAuthUserQuery, useLogoutMutation } from "@/features/auth/auth.api";
import { cn } from "@/lib/utils";

const menuItemClass =
  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-start text-xs font-medium text-[var(--text-h)] transition hover:bg-[var(--accent-bg)]";

function formatRolesForDisplay(roles: string[]): string {
  if (roles.length === 0) return "";
  return roles.map((r) => r.replace(/_/g, " ")).join(" · ");
}

function UserMetaLines({
  displayName,
  email,
  roleLine,
  noEmailLabel,
}: {
  displayName: string;
  email: string;
  roleLine: string;
  noEmailLabel: string;
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-0">
      <p className="truncate text-xs font-semibold leading-tight text-[var(--text-h)]">{displayName}</p>
      {email ? (
        <p className="truncate text-[0.65rem] leading-tight text-[var(--text-muted)]">{email}</p>
      ) : (
        <p className="truncate text-[0.65rem] leading-tight text-[var(--text-muted)]">{noEmailLabel}</p>
      )}
      {roleLine ? (
        <p
          className="truncate text-[0.625rem] font-medium capitalize leading-tight tracking-wide text-[var(--text-muted)] opacity-90"
          title={roleLine}
        >
          {roleLine}
        </p>
      ) : null}
    </div>
  );
}

export function SidebarUserProfile() {
  const { t } = useTranslation("translation", { keyPrefix: "userMenu" });
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const { data: user } = useAuthUserQuery();
  const logoutMutation = useLogoutMutation();

  const displayName = user?.name?.trim() || t("fallbackName");
  const email = user?.email?.trim() || "";
  const verified = Boolean(user?.email_verified_at);
  const roleLine = user ? formatRolesForDisplay(user.roles) : "";

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

  return (
    <div ref={rootRef} className="relative">
      <div className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-1.5 py-1">
        <SidebarUserAvatar name={displayName} verified={verified} size="sm" />
        <UserMetaLines
          displayName={displayName}
          email={email}
          roleLine={roleLine}
          noEmailLabel={t("noEmail")}
        />
        <button
          type="button"
          className={cn(
            "inline-flex size-7 shrink-0 items-center justify-center rounded-md border border-transparent text-[var(--text-h)] transition hover:border-[var(--border)] hover:bg-[var(--accent-bg)]",
            open && "border-[var(--border)] bg-[var(--accent-bg)]"
          )}
          aria-expanded={open}
          aria-haspopup="menu"
          aria-label={t("openMenu")}
          onClick={() => setOpen((v) => !v)}
        >
          <IoEllipsisVertical className="size-3.5" aria-hidden />
        </button>
      </div>

      {open ? (
        <div
          className="absolute inset-x-0 bottom-full z-50 mb-1.5 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] shadow-[var(--shadow)]"
          role="menu"
          aria-label={t("menuLabel")}
        >
          <div className="flex items-center gap-2 border-b border-[var(--border)] px-2 py-1.5">
            <SidebarUserAvatar name={displayName} verified={verified} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold leading-tight text-[var(--text-h)]">{displayName}</p>
              {email ? (
                <p className="truncate text-[0.65rem] leading-tight text-[var(--text-muted)]">{email}</p>
              ) : null}
              {roleLine ? (
                <p className="truncate text-[0.625rem] font-medium capitalize leading-tight text-[var(--text-muted)] opacity-90">
                  {roleLine}
                </p>
              ) : null}
            </div>
          </div>
          <div className="p-1" role="none">
            <Link href="/edit-profile" role="menuitem" className={menuItemClass} onClick={close}>
              <IoPersonCircle className="size-3.5 shrink-0 opacity-80" aria-hidden />
              {t("editProfile")}
            </Link>
            <Link href="/change-password" role="menuitem" className={menuItemClass} onClick={close}>
              <IoKey className="size-3.5 shrink-0 opacity-80" aria-hidden />
              {t("changePassword")}
            </Link>
            <button
              type="button"
              role="menuitem"
              disabled={logoutMutation.isPending}
              aria-busy={logoutMutation.isPending}
              className={cn(menuItemClass, "text-[var(--destructive-muted)]", logoutMutation.isPending && "pointer-events-none opacity-90")}
              onClick={() => void onLogout()}
            >
              {logoutMutation.isPending ? (
                <Spinner className="size-3.5 shrink-0 text-current" aria-hidden />
              ) : (
                <IoLogOutOutline className="size-3.5 shrink-0 opacity-90" aria-hidden />
              )}
              {t("logOut")}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
