"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { AuthScreenShell } from "@/components/auth/auth-screen-shell";
import {
  SignInFormSection,
  type SignInAuthAlert,
} from "@/sections/sign-in-form-section";
import type { SignInValues } from "@/sections/sign-in.types";

export function SignInScreen() {
  const [authAlert, setAuthAlert] = useState<SignInAuthAlert | null>(null);

  const form = useForm<SignInValues>({
    defaultValues: { email: "", password: "" },
    mode: "onBlur",
  });

  async function onSubmit(_values: SignInValues) {
    setAuthAlert(null);
    // API integration pending
  }

  return (
    <AuthScreenShell>
      <SignInFormSection
        register={form.register}
        errors={form.formState.errors}
        isSubmitting={form.formState.isSubmitting}
        onValidSubmit={form.handleSubmit(onSubmit)}
        authAlert={authAlert}
      />
    </AuthScreenShell>
  );
}
