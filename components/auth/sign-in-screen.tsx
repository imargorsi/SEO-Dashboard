"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { AuthScreenShell } from "@/components/auth/auth-screen-shell";
import { SignInFormSection, type SignInAuthAlert } from "@/sections/sign-in-form-section";
import type { SignInValues } from "@/sections/sign-in.types";
import { useLoginMutation } from "@/features/auth/auth.api";
import { ApiError } from "@/lib/frontend/api/errors";
import { resolvePostLoginPath } from "@/lib/frontend/auth/session";

export function SignInScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const loginMutation = useLoginMutation();
  const { t } = useTranslation("translation", { keyPrefix: "auth.signIn" });
  const [submitAlert, setSubmitAlert] = useState<SignInAuthAlert | null>(null);

  const verified = searchParams.get("verified") === "1";
  const registered = searchParams.get("registered") === "1";
  const registrationMessage = searchParams.get("message")?.trim() ?? "";
  const emailFromQuery = searchParams.get("email")?.trim() ?? "";

  const queryAlert = useMemo((): SignInAuthAlert | null => {
    if (verified) {
      return { variant: "default", title: t("emailVerifiedSuccess") };
    }
    if (registered) {
      return {
        variant: "default",
        title: registrationMessage || t("registrationSuccess"),
      };
    }
    return null;
  }, [registered, registrationMessage, t, verified]);

  const form = useForm<SignInValues>({
    defaultValues: { email: emailFromQuery, password: "" },
    mode: "onBlur",
  });

  useEffect(() => {
    if (verified) {
      router.replace("/", { scroll: false });
      return;
    }

    if (registered) {
      router.replace(emailFromQuery ? `/?email=${encodeURIComponent(emailFromQuery)}` : "/", { scroll: false });
    }
  }, [emailFromQuery, registered, router, verified]);

  async function onSubmit(values: SignInValues) {
    setSubmitAlert(null);

    try {
      const result = await loginMutation.mutateAsync({
        email: values.email.trim(),
        password: values.password,
      });

      router.push(resolvePostLoginPath(result.user));
    } catch (error) {
      setSubmitAlert({
        variant: "destructive",
        title: ApiError.messageFrom(error, t("loginErrorUnexpected"), "email"),
      });
    }
  }

  return (
    <AuthScreenShell>
      <SignInFormSection
        register={form.register}
        errors={form.formState.errors}
        isSubmitting={form.formState.isSubmitting || loginMutation.isPending}
        onValidSubmit={form.handleSubmit(onSubmit)}
        authAlert={submitAlert ?? queryAlert}
      />
    </AuthScreenShell>
  );
}
