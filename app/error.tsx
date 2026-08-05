"use client";

import { AppErrorBoundary } from "@/components/errors/app-error-boundary";

type TRootErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function RootError({ error, reset }: TRootErrorProps) {
  return <AppErrorBoundary error={error} reset={reset} scope="root-error" />;
}
