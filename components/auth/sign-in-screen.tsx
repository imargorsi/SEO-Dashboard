"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { AuthScreenShell } from "@/components/auth/auth-screen-shell";
import { SignInFormSection, type SignInAuthAlert } from "@/sections/sign-in-form-section";
import type { SignInValues } from "@/sections/sign-in.types";
import { useLoginMutation } from "@/features/auth/hooks";
import { ApiError } from "@/lib/frontend/api/errors";
import { resolvePostLoginPath } from "@/lib/frontend/auth/session";

export function SignInScreen() {
  const router = useRouter();
  const loginMutation = useLoginMutation();
  const { t } = useTranslation("translation", { keyPrefix: "auth.signIn" });
  const [authAlert, setAuthAlert] = useState<SignInAuthAlert | null>(null);

  const form = useForm<SignInValues>({
    defaultValues: { email: "", password: "" },
    mode: "onBlur",
  });

  async function onSubmit(values: SignInValues) {
    setAuthAlert(null);

    try {
      const result = await loginMutation.mutateAsync({
        email: values.email.trim(),
        password: values.password,
      });

      router.push(resolvePostLoginPath(result.user));
    } catch (error) {
      const text =
        error instanceof ApiError
          ? (error.firstFieldMessage("email") ?? error.message)
          : error instanceof Error
            ? error.message
            : t("loginErrorUnexpected");

      setAuthAlert({ variant: "destructive", title: text });
    }
  }

  return (
    <AuthScreenShell>
      <SignInFormSection
        register={form.register}
        errors={form.formState.errors}
        isSubmitting={form.formState.isSubmitting || loginMutation.isPending}
        onValidSubmit={form.handleSubmit(onSubmit)}
        authAlert={authAlert}
      />
    </AuthScreenShell>
  );
}
