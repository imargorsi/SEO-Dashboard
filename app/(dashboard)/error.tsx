"use client";

import { AppErrorBoundary } from "@/components/errors/app-error-boundary";

type TDashboardErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function DashboardError({ error, reset }: TDashboardErrorProps) {
  return (
    <AppErrorBoundary error={error} reset={reset} compact scope="dashboard-error" />
  );
}
