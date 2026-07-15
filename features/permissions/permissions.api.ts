"use client";

import { useQuery } from "@tanstack/react-query";

import { baseQuery } from "@/lib/frontend/api/base";
import type { TPermissionCatalog } from "@/types/permission-catalog.types";

const permissionsApi = {
  reducerPath: "permissions-api" as const,
};

const permissionsKeys = {
  catalog: [permissionsApi.reducerPath, "catalog"] as const,
};

export { permissionsKeys };

async function fetchPermissionCatalog(): Promise<TPermissionCatalog> {
  const envelope = await baseQuery.get<TPermissionCatalog>("admin/permissions");
  return envelope.data;
}

/** Fixed v1 permission catalog — safe to cache for the session (`doc/rbac.md`). */
export function usePermissionCatalogQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: permissionsKeys.catalog,
    queryFn: fetchPermissionCatalog,
    enabled: options?.enabled ?? true,
    staleTime: Infinity,
  });
}
