"use client";

import { Suspense, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";

import { AuthScreenShell } from "@/components/auth/auth-screen-shell";
import { AuthSessionLoading } from "@/components/auth/auth-session-loading";
import { SignInAuthCardShell } from "@/components/sign-in-auth-card-shell";
import { AuthFormHeader } from "@/components/auth/auth-form-header";
import { Paragraph } from "@/components/paragraph";
import { Spinner } from "@/components/ui/spinner";
import { useGoogleExchangeMutation } from "@/features/auth/auth.api";
import { useAuthReveal } from "@/context/auth-reveal-transition";
import { ApiError } from "@/lib/frontend/api/errors";
import { resolvePostLoginPath } from "@/lib/frontend/auth/session";
import { notify } from "@/lib/frontend/feedback/notify";

function GoogleOAuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code")?.trim() ?? "";
  const exchangeMutation = useGoogleExchangeMutation();
  const { armAuthReveal, disarmAuthReveal, beginAuthReveal } = useAuthReveal();
  const { t } = useTranslation("translation", { keyPrefix: "auth.signIn" });
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    if (!code) {
      notify.error(t("googleExchangeMissing"));
      router.replace("/");
      return;
    }

    armAuthReveal();
    void exchangeMutation
      .mutateAsync(code)
      .then((result) => {
        beginAuthReveal(resolvePostLoginPath(result.user));
      })
      .catch((error) => {
        disarmAuthReveal();
        notify.error(ApiError.messageFrom(error, t("googleExchangeFailed")));
        router.replace("/");
      });
    // One-shot exchange on land.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  return (
    <AuthScreenShell>
      <SignInAuthCardShell ariaLabelledBy="google-oauth-heading">
        <AuthFormHeader
          id="google-oauth-heading"
          title={t("googleCallbackTitle")}
          subtitle={t("googleCallbackSubtitle")}
        />
        <div className="mt-8 flex justify-center">
          <Spinner className="size-6 text-brand" />
        </div>
        <Paragraph moreSmaller className="mt-4 text-center text-text-muted">
          {t("googleCallbackBody")}
        </Paragraph>
      </SignInAuthCardShell>
    </AuthScreenShell>
  );
}

export default function GoogleOAuthCallbackPage() {
  return (
    <Suspense fallback={<AuthSessionLoading />}>
      <GoogleOAuthCallbackContent />
    </Suspense>
  );
}
