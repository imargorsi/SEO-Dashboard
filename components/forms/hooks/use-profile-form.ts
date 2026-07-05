"use client";

import { useForm } from "react-hook-form";

import type { AuthUser } from "@/lib/frontend/auth/types";

export type ProfileFormValues = {
  name: string;
  email: string;
  profile_image: string;
};

export function authUserToProfileFormValues(user: AuthUser): ProfileFormValues {
  return {
    name: user.name,
    email: user.email,
    profile_image: user.profile_image ?? "",
  };
}

export function useProfileForm(user: AuthUser) {
  const form = useForm<ProfileFormValues>({
    defaultValues: authUserToProfileFormValues(user),
    mode: "onSubmit",
  });

  async function onSubmit(values: ProfileFormValues) {
    console.log(values, "profile form values"); // later -> mutation
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
