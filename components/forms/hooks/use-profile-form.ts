"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { useUpdateProfileMutation } from "@/features/auth/auth.api";
import { ApiError } from "@/lib/frontend/api/errors";
import { notify } from "@/lib/frontend/feedback/notify";
import type { AuthUser } from "@/lib/frontend/auth/types";

export type ProfileFormValues = {
  name: string;
};

export function useProfileForm(user: AuthUser) {
  const { t } = useTranslation("translation", { keyPrefix: "profile.edit" });
  const updateProfileMutation = useUpdateProfileMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingFileRef = useRef<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const form = useForm<ProfileFormValues>({
    defaultValues: { name: user.name },
    mode: "onSubmit",
  });

  const {
    register,
    handleSubmit,
    reset,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = form;

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  function onFilePicked(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    event.target.value = "";
    if (!file) return;

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    pendingFileRef.current = file;
    setPreviewUrl(URL.createObjectURL(file));
  }

  async function onSubmit(values: ProfileFormValues) {
    const payload: { name?: string; profile_image_file?: File } = {};
    const trimmedName = values.name.trim();

    if (trimmedName !== user.name) payload.name = trimmedName;
    if (pendingFileRef.current) payload.profile_image_file = pendingFileRef.current;

    if (!payload.name && !payload.profile_image_file) {
      notify.info(t("noChanges"));
      return;
    }

    try {
      const result = await updateProfileMutation.mutateAsync(payload);
      pendingFileRef.current = null;
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      reset({ name: result.user.name });
      notify.success(result.message?.trim() || t("successFallback"));
    } catch (error) {
      if (error instanceof ApiError) {
        const nameMessage = error.errors.name?.[0];
        if (nameMessage) setError("name", { type: "server", message: nameMessage });

        notify.error(error.message?.trim() || error.firstFieldMessage() || t("errorFallback"));
        return;
      }

      notify.error(t("errorFallback"));
    }
  }

  const name = watch("name");

  return {
    register,
    handleSubmit,
    errors,
    isSubmitting: isSubmitting || updateProfileMutation.isPending,
    onSubmit,
    fileInputRef,
    openFilePicker,
    onFilePicked,
    avatarImageUrl: previewUrl ?? user.profile_image ?? null,
    name,
    hasPhoto: Boolean(previewUrl || user.profile_image),
  };
}
