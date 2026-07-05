"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { useForm } from "react-hook-form";

import type { AuthUser } from "@/lib/frontend/auth/types";
import { validateProfileImageFile } from "@/lib/frontend/forms/profile-image-validation";

export type ProfileFormValues = {
  name: string;
  email: string;
  profile_image: File | null;
};

export function authUserToProfileFormValues(user: AuthUser): ProfileFormValues {
  return {
    name: user.name,
    email: user.email,
    profile_image: null,
  };
}

export function useProfileForm(user: AuthUser) {
  const form = useForm<ProfileFormValues>({
    defaultValues: authUserToProfileFormValues(user),
    mode: "onSubmit",
  });

  const profileImage = form.watch("profile_image");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!profileImage) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(profileImage);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [profileImage]);

  function handleProfileImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      form.setValue("profile_image", null);
      form.clearErrors("profile_image");
      return;
    }

    const message = validateProfileImageFile(file);
    if (message) {
      form.setError("profile_image", { type: "validate", message });
      form.setValue("profile_image", null);
      event.target.value = "";
      return;
    }

    form.clearErrors("profile_image");
    form.setValue("profile_image", file, { shouldDirty: true });
  }

  async function onSubmit(values: ProfileFormValues) {
    if (values.profile_image) {
      const message = validateProfileImageFile(values.profile_image);
      if (message) {
        form.setError("profile_image", { type: "validate", message });
        return;
      }
    }

    console.log(values, "profile form values"); // later -> mutation
  }

  return {
    register: form.register,
    handleSubmit: form.handleSubmit,
    watch: form.watch,
    errors: form.formState.errors,
    isSubmitting: form.formState.isSubmitting,
    onSubmit,
    handleProfileImageChange,
    avatarImageUrl: previewUrl ?? user.profile_image ?? null,
  };
}
