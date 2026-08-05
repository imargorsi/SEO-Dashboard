"use client";

import { useEffect } from "react";

import { AppErrorScreen } from "@/components/ui/app-error-screen";
import { ERROR_COPY } from "@/lib/frontend/feedback/error-copy";
import { reportClientError } from "@/lib/frontend/feedback/report-client-error";

import "./globals.css";

type TGlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: TGlobalErrorProps) {
  useEffect(() => {
    reportClientError(error, {
      scope: "global-error",
      digest: error.digest,
    });
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-svh font-sans antialiased">
        <AppErrorScreen
          title={ERROR_COPY.title}
          description={ERROR_COPY.description}
          retryLabel={ERROR_COPY.tryAgain}
          homeLabel={ERROR_COPY.goHome}
          homeHref="/"
          onRetry={reset}
        />
      </body>
    </html>
  );
}
