"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { AuthScreenShell } from "@/components/auth/auth-screen-shell";
import { RegisterFormSection, type RegisterAuthAlert } from "@/sections/register-form-section";
import type { RegisterValues } from "@/sections/register.types";

export function RegisterScreen() {
  const [authAlert, setAuthAlert] = useState<RegisterAuthAlert | null>(null);

  const form = useForm<RegisterValues>({
    defaultValues: {
      company_name: "",
      poc_name: "",
      poc_email: "",
      password: "",
      password_confirmation: "",
    },
    mode: "onBlur",
  });

  async function onSubmit(_values: RegisterValues) {
    setAuthAlert(null);
    // API integration pending
  }

  return (
    <AuthScreenShell>
      <RegisterFormSection
        register={form.register}
        errors={form.formState.errors}
        isSubmitting={form.formState.isSubmitting}
        onValidSubmit={form.handleSubmit(onSubmit)}
        authAlert={authAlert}
      />
    </AuthScreenShell>
  );
}
