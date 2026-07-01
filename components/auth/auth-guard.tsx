"use client";

import { useSyncExternalStore, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AuthSessionLoading } from "@/components/auth/auth-session-loading";
import { useAuthUserQuery } from "@/features/auth/auth.api";
import { getAccessToken, resolvePostLoginPath } from "@/lib/frontend/auth/session";
import { useIsAuthRevealActive } from "@/context/auth-reveal-transition";

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

/** Auth screens — redirect to dashboard when already logged in. */
export function GuestOnly({ children }: { children: ReactNode }) {
  const router = useRouter();
  const isClient = useIsClient();
  const isRevealActive = useIsAuthRevealActive();
  const hasToken = isClient && Boolean(getAccessToken());
  const { data: user, isPending, isFetching } = useAuthUserQuery({ enabled: hasToken });

  useEffect(() => {
    if (user && !isRevealActive) {
      router.replace(resolvePostLoginPath(user));
    }
  }, [router, user, isRevealActive]);

  if (isRevealActive) {
    return children;
  }

  if (!isClient || (hasToken && (isPending || isFetching)) || user) {
    return <AuthSessionLoading />;
  }

  return children;
}

/** Dashboard — redirect to sign-in when not authenticated. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const router = useRouter();
  const isClient = useIsClient();
  const hasToken = isClient && Boolean(getAccessToken());
  const { data: user, isPending, isError } = useAuthUserQuery({ enabled: hasToken });

  useEffect(() => {
    if (isClient && (!hasToken || isError)) {
      router.replace("/");
    }
  }, [hasToken, isClient, isError, router]);

  if (!isClient || !hasToken || isPending || !user || isError) {
    return <AuthSessionLoading />;
  }

  return children;
}
