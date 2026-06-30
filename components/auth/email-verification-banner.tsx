"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { IoAlertCircle, IoCheckmarkCircle } from "react-icons/io5";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AuthSubmitButton } from "@/components/auth/auth-submit-button";
import { Spinner } from "@/components/ui/spinner";
import { useAuthUserQuery, useResendEmailVerificationMutation } from "@/features/auth/auth.api";
import { ApiError } from "@/lib/frontend/api/errors";

export function EmailVerificationBanner() {
  const { t } = useTranslation("translation", { keyPrefix: "auth.verification" });
  const { data: user } = useAuthUserQuery();
  const resendMutation = useResendEmailVerificationMutation();
  const [feedback, setFeedback] = useState<{ variant: "default" | "destructive"; title: string } | null>(null);

  if (!user || user.email_verified_at) {
    return null;
  }

  async function handleResend() {
    setFeedback(null);

    try {
      const result = await resendMutation.mutateAsync();
      const title = result.message?.trim() || t("resendSuccess");
      setFeedback({ variant: "default", title });
    } catch (error) {
      setFeedback({
        variant: "destructive",
        title: ApiError.messageFrom(error, t("resendErrorFallback")),
      });
    }
  }

  return (
    <div className="border-b border-[var(--border)] bg-[var(--bg)] px-4 py-3 md:px-6">
      <Alert variant={feedback?.variant === "destructive" ? "destructive" : "default"}>
        {feedback?.variant === "destructive" ? (
          <IoAlertCircle className="size-4 shrink-0" aria-hidden />
        ) : (
          <IoCheckmarkCircle className="size-4 shrink-0" aria-hidden />
        )}
        <AlertTitle>{feedback?.title ?? t("title")}</AlertTitle>
        {!feedback ? <AlertDescription>{t("description")}</AlertDescription> : null}
      </Alert>

      {!feedback || feedback.variant === "destructive" ? (
        <div className="mt-3">
          <AuthSubmitButton
            type="button"
            disabled={resendMutation.isPending}
            className="!w-auto px-4 py-2 text-sm"
            onClick={() => void handleResend()}
          >
            {resendMutation.isPending ? <Spinner className="size-4 shrink-0 text-white" /> : null}
            {t("resendCta")}
          </AuthSubmitButton>
        </div>
      ) : null}
    </div>
  );
}
