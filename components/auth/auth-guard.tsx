"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AuthSessionLoading } from "@/components/auth/auth-session-loading";
import { useAuthUserQuery } from "@/features/auth/auth.api";
import { useAccessToken } from "@/hooks/use-access-token.hook";
import { resolvePostLoginPath } from "@/lib/frontend/auth/session";
import { useIsAuthRevealActive, useIsAuthRevealing } from "@/context/auth-reveal-transition";

/** Auth screens — redirect to dashboard when already logged in. */
export function GuestOnly({ children }: { children: ReactNode }) {
  const router = useRouter();
  const token = useAccessToken();
  const hasToken = Boolean(token);
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

  if ((hasToken && (isPending || isFetching)) || user) {
    return <AuthSessionLoading />;
  }

  return children;
}

/** Dashboard — redirect to sign-in when not authenticated. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const router = useRouter();
  const token = useAccessToken();
  const hasToken = Boolean(token);
  const isRevealing = useIsAuthRevealing();
  const { data: user, isPending, isError } = useAuthUserQuery({ enabled: hasToken });

  useEffect(() => {
    if (!hasToken || isError) {
      router.replace("/");
    }
  }, [hasToken, isError, router]);

  if (!hasToken || isError) {
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
