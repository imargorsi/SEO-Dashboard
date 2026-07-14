"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import type { TUserCreateFormValues, TUserFormProps } from "@/components/forms/user-create-form.types";
import { useCreateUserMutation, useUpdateUserMutation } from "@/features/users/users.api";
import { ApiError } from "@/lib/frontend/api/errors";
import { notify } from "@/lib/frontend/feedback/notify";
import { USER_ROUTES } from "@/lib/frontend/users/user-routes.utils";

const DEFAULT_VALUES: TUserCreateFormValues = {
  name: "",
  email: "",
  password: "",
  password_confirmation: "",
};

export function useUserCreateForm({
  isEdit = false,
  userId,
  initialValues,
  initialProfileImageUrl = null,
}: TUserFormProps = {}) {
  const router = useRouter();
  const { t } = useTranslation("translation", { keyPrefix: "modules.users.createForm" });
  const createMutation = useCreateUserMutation();
  const updateMutation = useUpdateUserMutation();
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profilePreviewUrl, setProfilePreviewUrl] = useState<string | null>(initialProfileImageUrl);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setError,
    formState: { errors },
  } = useForm<TUserCreateFormValues>({
    defaultValues: initialValues ?? DEFAULT_VALUES,
    mode: "onSubmit",
  });

  const name = watch("name");
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (!initialValues) return;
    reset(initialValues);
  }, [initialValues, reset]);

  useEffect(() => {
    if (profileImageFile) return;
    setProfilePreviewUrl(initialProfileImageUrl);
  }, [initialProfileImageUrl, profileImageFile]);

  useEffect(() => {
    if (!profileImageFile) return;

    const objectUrl = URL.createObjectURL(profileImageFile);
    setProfilePreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [profileImageFile]);

  const onProfileImagePicked = useCallback((file: File) => {
    setProfileImageFile(file);
  }, []);

  const passwordRules = useMemo(() => {
    if (isEdit) {
      return {
        validate: (value: string) => {
          if (!value) return true;
          return value.length >= 8 || t("valMinPassword");
        },
      };
    }

    return {
      required: t("valRequired"),
      minLength: { value: 8, message: t("valMinPassword") },
    };
  }, [isEdit, t]);

  const passwordConfirmationRules = useMemo(() => {
    if (isEdit) {
      return {
        validate: (value: string, formValues: TUserCreateFormValues) => {
          if (!formValues.password && !value) return true;
          if (!formValues.password) return true;
          return value === formValues.password || t("valPasswordMatch");
        },
      };
    }

    return {
      required: t("valRequired"),
      validate: (value: string, formValues: TUserCreateFormValues) =>
        value === formValues.password || t("valPasswordMatch"),
    };
  }, [isEdit, t]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (isEdit) {
        if (!userId) {
          notify.error(t("editErrorFallback"));
          return;
        }

        const payload: {
          name: string;
          email: string;
          password?: string;
          password_confirmation?: string;
        } = {
          name: values.name.trim(),
          email: values.email.trim(),
        };

        if (values.password) {
          payload.password = values.password;
          payload.password_confirmation = values.password_confirmation;
        }

        await updateMutation.mutateAsync({
          userId,
          payload,
          profileImageFile,
        });
        notify.success(t("editSuccessFallback"));
        router.push(USER_ROUTES.list);
        return;
      }

      await createMutation.mutateAsync({
        payload: {
          name: values.name.trim(),
          email: values.email.trim(),
          password: values.password,
          password_confirmation: values.password_confirmation,
        },
        profileImageFile,
      });
      notify.success(t("successFallback"));
      router.push(USER_ROUTES.list);
    } catch (error) {
      if (error instanceof ApiError) {
        const fieldMap: Partial<Record<keyof TUserCreateFormValues, string | undefined>> = {
          name: error.errors.name?.[0],
          email: error.errors.email?.[0],
          password: error.errors.password?.[0],
          password_confirmation: error.errors.password_confirmation?.[0],
        };

        (Object.keys(fieldMap) as Array<keyof TUserCreateFormValues>).forEach((key) => {
          const message = fieldMap[key];
          if (message) setError(key, { type: "server", message });
        });

        notify.error(ApiError.messageFrom(error, isEdit ? t("editErrorFallback") : t("errorFallback")));
        return;
      }

      notify.error(isEdit ? t("editErrorFallback") : t("errorFallback"));
    }
  });

  return {
    t,
    register,
    errors,
    name,
    isEdit,
    isSubmitting,
    profilePreviewUrl,
    onProfileImagePicked,
    onSubmit,
    passwordRules,
    passwordConfirmationRules,
  };
}

export type TUseUserCreateFormResult = ReturnType<typeof useUserCreateForm>;
