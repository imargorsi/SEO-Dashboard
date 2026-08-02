"use client";

import { useMemo } from "react";

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
  const { data, isPending, isError } = useUsersQuery({
    per_page: OWNER_LIST_PAGE_SIZE,
    enabled,
  });

  const options = useMemo((): Option[] => {
    return (data?.items ?? [])
      .filter((user) => Boolean(user.email_verified_at))
      .map((user) => ({
        label: `${user.name} (${user.email})`,
        value: user.id,
      }));
  }, [data?.items]);

  return {
    options,
    isPending,
    isError,
    isEmpty: !isPending && options.length === 0,
  };
}
