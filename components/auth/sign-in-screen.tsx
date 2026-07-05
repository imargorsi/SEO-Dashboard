"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { AuthScreenShell } from "@/components/auth/auth-screen-shell";
import { SignInFormSection } from "@/sections/sign-in-form-section";
import type { SignInValues } from "@/sections/sign-in.types";
import { useLoginMutation } from "@/features/auth/auth.api";
import { ApiError } from "@/lib/frontend/api/errors";
import { notify } from "@/lib/frontend/feedback/notify";
import { resolvePostLoginPath } from "@/lib/frontend/auth/session";
import { useAuthReveal } from "@/context/auth-reveal-transition";

export function SignInScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const loginMutation = useLoginMutation();
  const { armAuthReveal, disarmAuthReveal, beginAuthReveal } = useAuthReveal();
  const { t } = useTranslation("translation", { keyPrefix: "auth.signIn" });
  const queryToastShown = useRef(false);

  const verified = searchParams.get("verified") === "1";
  const registered = searchParams.get("registered") === "1";
  const registrationMessage = searchParams.get("message")?.trim() ?? "";
  const emailFromQuery = searchParams.get("email")?.trim() ?? "";

  const form = useForm<SignInValues>({
    defaultValues: { email: emailFromQuery, password: "" },
    mode: "onBlur",
  });

  useEffect(() => {
    if (queryToastShown.current) return;

    if (verified) {
      queryToastShown.current = true;
      notify.success(t("emailVerifiedSuccess"));
      router.replace("/", { scroll: false });
      return;
    }

    if (registered) {
      queryToastShown.current = true;
      notify.success(registrationMessage || t("registrationSuccess"));
      router.replace(emailFromQuery ? `/?email=${encodeURIComponent(emailFromQuery)}` : "/", { scroll: false });
    }
  }, [emailFromQuery, registered, registrationMessage, router, t, verified]);

  useEffect(() => {
    return () => {
      disarmAuthReveal();
    };
  }, [disarmAuthReveal]);

  async function onSubmit(values: SignInValues) {
    armAuthReveal();

    try {
      const result = await loginMutation.mutateAsync({
        email: values.email.trim(),
        password: values.password,
      });

      beginAuthReveal(resolvePostLoginPath(result.user));
    } catch (error) {
      disarmAuthReveal();
      notify.error(ApiError.messageFrom(error, t("loginErrorUnexpected"), "email"));
    }
  }

  return (
    <AuthScreenShell>
      <SignInFormSection
        register={form.register}
        errors={form.formState.errors}
        isSubmitting={form.formState.isSubmitting || loginMutation.isPending}
        onValidSubmit={form.handleSubmit(onSubmit)}
      />
    </AuthScreenShell>
  );
}
