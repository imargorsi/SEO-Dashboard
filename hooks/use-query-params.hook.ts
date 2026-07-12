"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { normalizeSearchParams } from "@/lib/frontend/routing/normalize-search-params.utils";

type TQueryParamValue = string | string[];
type TQueryParamsObject = Record<string, TQueryParamValue>;

type TSetQueryParamValue = string | number | (string | number)[];

function pushIfChanged(
  router: ReturnType<typeof useRouter>,
  currentParams: ReturnType<typeof useSearchParams>,
  searchParams: URLSearchParams,
) {
  const prev = normalizeSearchParams(new URLSearchParams(currentParams.toString()));
  const next = normalizeSearchParams(searchParams);
  if (next === prev) return;

  router.push(`?${next}`, { scroll: false });
}

export function useQueryParams() {
  const router = useRouter();
  const currentParams = useSearchParams();

  const queryParams = useMemo(() => {
    const paramsAsURL = new URLSearchParams(currentParams.toString());
    const paramsAsObj: TQueryParamsObject = {};

    paramsAsURL.forEach((value, key) => {
      if (key in paramsAsObj) {
        if (Array.isArray(paramsAsObj[key])) {
          (paramsAsObj[key] as string[]).push(value);
        } else {
          paramsAsObj[key] = [paramsAsObj[key] as string, value];
        }
      } else {
        paramsAsObj[key] = value;
      }
    });

    return paramsAsObj;
  }, [currentParams]);

  const setQueryParams = (params: Record<string, TSetQueryParamValue>) => {
    const searchParams = new URLSearchParams(currentParams.toString());

    Object.entries(params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        searchParams.delete(key);
        value.forEach((v) => {
          if (v !== undefined && v !== null) searchParams.append(key, v.toString());
        });
      } else if (value !== undefined && value !== null) {
        searchParams.set(key, value.toString());
      }
    });

    pushIfChanged(router, currentParams, searchParams);
  };

  const deleteQueryParams = (keys: string[]) => {
    const searchParams = new URLSearchParams(currentParams.toString());

    keys.forEach((key) => {
      searchParams.delete(key);
    });

    pushIfChanged(router, currentParams, searchParams);
  };

  const deleteAllQueryParams = () => {
    const prev = currentParams.toString();
    if (!prev) return;

    router.push("?", { scroll: false });
  };

  const updateQueryParams = (
    paramsToSet: Record<string, TSetQueryParamValue>,
    keysToDelete: string[] = [],
  ) => {
    const searchParams = new URLSearchParams(currentParams.toString());

    keysToDelete.forEach((key) => searchParams.delete(key));

    Object.entries(paramsToSet).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        searchParams.delete(key);
        value.forEach((v) => {
          if (v !== undefined && v !== null) searchParams.append(key, v.toString());
        });
      } else if (value !== undefined && value !== null) {
        searchParams.set(key, value.toString());
      }
    });

    pushIfChanged(router, currentParams, searchParams);
  };

  return {
    queryParams,
    setQueryParams,
    deleteQueryParams,
    deleteAllQueryParams,
    updateQueryParams,
  };
}
