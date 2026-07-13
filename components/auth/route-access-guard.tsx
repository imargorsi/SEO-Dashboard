"use client";

import { useSyncExternalStore, useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

import { AuthSessionLoading } from "@/components/auth/auth-session-loading";
import { useProjectAccess } from "@/context/project-access-context";
import { useSelectedProject } from "@/context/selected-project-context";
import { useAuthUserQuery } from "@/features/auth/auth.api";
import { getAccessToken } from "@/lib/frontend/auth/session";
import {
  canAccessRoute,
  isAuthOnlyRoute,
  resolveDefaultAccessiblePath,
} from "@/lib/frontend/layout/route-access";
import { isSuperAdmin } from "@/lib/rbac/access";

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
  const { selectedProject } = useSelectedProject();
  const { projectPermissions, isLoading: isProjectAccessLoading } = useProjectAccess();

  const isPlatformAdmin = user ? isSuperAdmin(user.roles) : false;
  const awaitingProjectAccess =
    Boolean(selectedProject?.id) && !isPlatformAdmin && isProjectAccessLoading;

  const allowed =
    user &&
    !awaitingProjectAccess &&
    canAccessRoute(pathname, user.permissions, projectPermissions, user.roles);

  const fallbackPath = user
    ? resolveDefaultAccessiblePath(user.permissions, projectPermissions, user.roles)
    : "/edit-profile";

  useEffect(() => {
    if (!user || allowed || awaitingProjectAccess) return;
    if (pathname !== fallbackPath) {
      router.replace(fallbackPath);
    }
  }, [allowed, awaitingProjectAccess, fallbackPath, pathname, router, user]);

  if (!isClient || !hasToken || isPending || !user || isError) {
    return <AuthSessionLoading />;
  }

  if (awaitingProjectAccess) {
    return <AuthSessionLoading />;
  }

  if (!allowed && pathname !== fallbackPath) {
    return <AuthSessionLoading />;
  }

  if (!isAuthOnlyRoute(pathname) && !isPlatformAdmin && !selectedProject) {
    return <AuthSessionLoading />;
  }

  return children;
}
