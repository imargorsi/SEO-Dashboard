"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import type { Option } from "@/components/input";
import { useUsersQuery } from "@/features/users/users.api";

const OWNER_LIST_PAGE_SIZE = 100;

export type TUseProjectOwnerOptionsResult = {
  options: Option[];
  isPending: boolean;
  isError: boolean;
  isEmpty: boolean;
};

export function useProjectOwnerOptions(enabled: boolean): TUseProjectOwnerOptionsResult {
  const { t } = useTranslation("translation", { keyPrefix: "modules.projects.createForm" });
  const { data, isPending, isError } = useUsersQuery({
    per_page: OWNER_LIST_PAGE_SIZE,
    enabled,
  });

  const options = useMemo((): Option[] => {
    const placeholder: Option = {
      label: t("ownerUserPlaceholder"),
      value: "",
    };

    const verifiedUsers = (data?.items ?? [])
      .filter((user) => Boolean(user.email_verified_at))
      .map((user) => ({
        label: `${user.name} (${user.email})`,
        value: user.id,
      }));

    return [placeholder, ...verifiedUsers];
  }, [data?.items, t]);

  return {
    options,
    isPending,
    isError,
    isEmpty: !isPending && options.length <= 1,
  };
}
