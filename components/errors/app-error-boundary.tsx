"use client";

import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { AppErrorScreen } from "@/components/ui/app-error-screen";
import { ERROR_COPY } from "@/lib/frontend/feedback/error-copy";
import { reportClientError } from "@/lib/frontend/feedback/report-client-error";

type TAppErrorBoundaryProps = {
  error: Error & { digest?: string };
  reset: () => void;
  compact?: boolean;
  scope?: string;
};

export function AppErrorBoundary({
  error,
  reset,
  compact = false,
  scope = "route-error",
}: TAppErrorBoundaryProps) {
  const { t } = useTranslation("translation", { keyPrefix: "ui.error" });

  useEffect(() => {
    reportClientError(error, {
      scope,
      digest: error.digest,
    });
  }, [error, scope]);

  return (
    <AppErrorScreen
      compact={compact}
      title={t("title", { defaultValue: ERROR_COPY.title })}
      description={t("description", { defaultValue: ERROR_COPY.description })}
      retryLabel={t("tryAgain", { defaultValue: ERROR_COPY.tryAgain })}
      homeLabel={t("goHome", { defaultValue: ERROR_COPY.goHome })}
      homeHref="/"
      onRetry={reset}
    />
  );
}
