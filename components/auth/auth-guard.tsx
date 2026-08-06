"use client";

import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AuthSessionLoading } from "@/components/auth/auth-session-loading";
import { useAuthUserQuery } from "@/features/auth/auth.api";
import { useAccessToken } from "@/hooks/use-access-token.hook";
import { resolvePostLoginPath } from "@/lib/frontend/auth/session";
import { useIsAuthRevealActive, useIsAuthRevealing } from "@/context/auth-reveal-transition";

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

/** Auth screens — redirect to dashboard when already logged in. */
export function GuestOnly({ children }: { children: ReactNode }) {
  const router = useRouter();
  const isClient = useIsClient();
  const token = useAccessToken();
  const hasToken = isClient && Boolean(token);
  const isRevealActive = useIsAuthRevealActive();
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
  const token = useAccessToken();
  const hasToken = isClient && Boolean(token);
  const isRevealing = useIsAuthRevealing();
  const { data: user, isPending, isError } = useAuthUserQuery({ enabled: hasToken });

  useEffect(() => {
    // Wait until the client snapshot has run — hydration still reports no token.
    if (!isClient) return;
    if (!hasToken || isError) {
      router.replace("/");
    }
  }, [hasToken, isClient, isError, router]);

  if (!isClient || !hasToken || isError) {
    return <AuthSessionLoading />;
  }

  if (isRevealing) {
    return children;
  }

  if (isPending || !user) {
    return <AuthSessionLoading />;
  }

  return children;
}
