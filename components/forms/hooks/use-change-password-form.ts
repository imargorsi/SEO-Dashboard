"use client";

import { useForm } from "react-hook-form";

export type ChangePasswordFormValues = {
  new_password: string;
  confirm_new_password: string;
};

const emptyValues: ChangePasswordFormValues = {
  new_password: "",
  confirm_new_password: "",
};

export function useChangePasswordForm() {
  const form = useForm<ChangePasswordFormValues>({
    defaultValues: emptyValues,
    mode: "onSubmit",
  });

  async function onSubmit(values: ChangePasswordFormValues) {
    console.log(values, "password form values");  
  }

  return {
    register: form.register,
    handleSubmit: form.handleSubmit,
    watch: form.watch,
    errors: form.formState.errors,
    isSubmitting: form.formState.isSubmitting,
    onSubmit,
  };
}
