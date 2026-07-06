"use client";

import { useSyncExternalStore, useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

import { AuthSessionLoading } from "@/components/auth/auth-session-loading";
import { useProjectAccess } from "@/context/project-access-context";
import { useAuthUserQuery } from "@/features/auth/auth.api";
import { getAccessToken } from "@/lib/frontend/auth/session";
import {
  canAccessRoute,
  resolveDefaultAccessiblePath,
} from "@/lib/frontend/layout/route-access";

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

/** Redirect when the current route requires permissions the user does not have. */
export function RequireRouteAccess({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isClient = useIsClient();
  const hasToken = isClient && Boolean(getAccessToken());
  const { data: user, isPending, isError } = useAuthUserQuery({ enabled: hasToken });
  const { projectPermissions } = useProjectAccess();

  const allowed =
    user &&
    canAccessRoute(pathname, user.permissions, projectPermissions, user.roles);

  const fallbackPath = user
    ? resolveDefaultAccessiblePath(user.permissions, projectPermissions, user.roles)
    : "/edit-profile";

  useEffect(() => {
    if (!user || allowed) return;
    if (pathname !== fallbackPath) {
      router.replace(fallbackPath);
    }
  }, [allowed, fallbackPath, pathname, router, user]);

  if (!isClient || !hasToken || isPending || !user || isError) {
    return <AuthSessionLoading />;
  }

  if (!allowed && pathname !== fallbackPath) {
    return <AuthSessionLoading />;
  }

  return children;
}
