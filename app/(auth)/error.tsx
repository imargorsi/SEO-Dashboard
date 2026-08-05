"use client";

import { AppErrorBoundary } from "@/components/errors/app-error-boundary";

type TAuthErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AuthError({ error, reset }: TAuthErrorProps) {
  return <AppErrorBoundary error={error} reset={reset} scope="auth-error" />;
}
