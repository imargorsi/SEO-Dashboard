"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { IoAdd } from "react-icons/io5";

import { RoleDetailSheet } from "@/components/roles/role-detail-sheet";
import { RoleStatusFilter } from "@/components/roles/role-status-filter";
import { RolesTable } from "@/components/roles/roles-table";
import { TableListSearch } from "@/components/table/table-list-search";
import { TableListSort } from "@/components/table/table-list-sort";
import { Heading } from "@/components/heading";
import { Paragraph } from "@/components/paragraph";
import { buttonVariants } from "@/components/ui/button";
import { useAuthUserQuery } from "@/features/auth/auth.api";
import { useRoleStatusActionMutation, useRolesQuery } from "@/features/roles/roles.api";
import { useQueryParams } from "@/hooks/use-query-params.hook";
import { ApiError } from "@/lib/frontend/api/errors";
import { roleCanCreate, roleCanUpdate, roleCanView } from "@/lib/frontend/roles/acl";
import { ROLE_ROUTES } from "@/lib/frontend/roles/role-routes.utils";
import { parseRolesListQuery } from "@/lib/frontend/roles/roles-list-query.utils";
import { notify } from "@/lib/frontend/feedback/notify";
import { isActiveRoleStatus, type TRoleStatus } from "@/lib/roles/constants";
import { EMPTY_ROLE_STATUS_COUNTS } from "@/lib/roles/role-status-filter.utils";
import type { TAdminRoleListItem } from "@/types/admin-role.types";
import { cn } from "@/lib/utils";

export function RolesListSection() {
  const router = useRouter();
  const { t } = useTranslation("translation", { keyPrefix: "modules.roles" });
  const { data: authUser, isLoading: isAuthLoading } = useAuthUserQuery();
  const { queryParams, setQueryParams, updateQueryParams, deleteQueryParams } = useQueryParams();
  const listQuery = parseRolesListQuery(queryParams);
  const canCreate = roleCanCreate(authUser?.permissions);
  const canView = useMemo(() => roleCanView(authUser?.permissions), [authUser]);
  const canUpdate = useMemo(() => roleCanUpdate(authUser?.permissions), [authUser]);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const statusMutation = useRoleStatusActionMutation();

  const { data, error, isLoading, isFetching } = useRolesQuery({
    page: listQuery.page,
    per_page: listQuery.per_page,
    search: listQuery.search,
    newest: listQuery.newest,
    status: listQuery.status,
    enabled: canView,
  });

  const statusCounts = data?.filters.status_counts ?? EMPTY_ROLE_STATUS_COUNTS;

  const accessDeniedNotified = useRef(false);
  const loadErrorNotified = useRef(false);

  useEffect(() => {
    if (isAuthLoading || canView || accessDeniedNotified.current) return;
    accessDeniedNotified.current = true;
    notify.error(t("table.accessDeniedBody"));
  }, [canView, isAuthLoading, t]);

  useEffect(() => {
    if (!error || loadErrorNotified.current) return;
    loadErrorNotified.current = true;
    notify.error(error instanceof Error ? error.message : t("table.loadErrorBody"));
  }, [error, t]);

  const sortOptions = useMemo(
    () => [
      { value: "newest", label: t("table.sortNewest") },
      { value: "oldest", label: t("table.sortOldest") },
    ],
    [t]
  );

  const onSearchChange = useCallback(
    (value: string) => {
      if (value) {
        updateQueryParams({ search: value }, ["page"]);
        return;
      }

      updateQueryParams({}, ["search", "page"]);
    },
    [updateQueryParams]
  );

  const onNewestChange = useCallback(
    (value: string) => {
      if (value === "newest") {
        deleteQueryParams(["newest"]);
        return;
      }

      setQueryParams({ newest: "false" });
    },
    [deleteQueryParams, setQueryParams]
  );

  const onStatusFilterChange = useCallback(
    (nextStatus: TRoleStatus | null) => {
      if (!nextStatus) {
        updateQueryParams({}, ["status", "page"]);
        return;
      }

      updateQueryParams({ status: nextStatus }, ["page"]);
    },
    [updateQueryParams]
  );

  const onPageChange = useCallback(
    (page: number) => {
      if (page <= 1) {
        deleteQueryParams(["page"]);
        return;
      }

      setQueryParams({ page: String(page) });
    },
    [deleteQueryParams, setQueryParams]
  );

  const onViewRole = useCallback((roleId: string) => {
    setSelectedRoleId(roleId);
  }, []);

  const onEditRole = useCallback(
    (roleId: string) => {
      router.push(ROLE_ROUTES.edit(roleId));
    },
    [router]
  );

  const onDetailOpenChange = useCallback((open: boolean) => {
    if (!open) setSelectedRoleId(null);
  }, []);

  const onToggleRoleStatus = useCallback(
    async (role: TAdminRoleListItem) => {
      const action = isActiveRoleStatus(role.status) ? "deactivate" : "activate";
      try {
        const result = await statusMutation.mutateAsync({ roleId: role.id, action });
        notify.success(
          result.message?.trim() || t(action === "activate" ? "table.activateSuccess" : "table.deactivateSuccess")
        );
      } catch (error) {
        notify.error(ApiError.messageFrom(error, t("table.statusActionError")));
      }
    },
    [statusMutation, t]
  );

  return (
    <div className="w-full min-w-0">
      <div className="space-y-5 px-4 py-6 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <Heading id="roles-list-title" pageTitle>
              {t("title")}
            </Heading>
            <Paragraph className="text-text-muted">{t("subtitle")}</Paragraph>
          </div>

          {canCreate ? (
            <Link href="/roles/new" className={cn(buttonVariants({ size: "md", variant: "gradient" }))}>
              <IoAdd className="size-4" aria-hidden />
              {t("table.createRole")}
            </Link>
          ) : null}
        </div>

        {canView ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <TableListSearch
                value={listQuery.search}
                onChange={onSearchChange}
                placeholder={t("table.searchPlaceholder")}
                isLoading={isFetching}
              />
              <TableListSort
                value={listQuery.newest ? "newest" : "oldest"}
                onChange={onNewestChange}
                options={sortOptions}
                ariaLabel={t("table.sortToggle", {
                  direction: listQuery.newest ? t("table.sortNewest") : t("table.sortOldest"),
                })}
              />
              <RoleStatusFilter
                activeStatus={listQuery.status}
                counts={statusCounts}
                onStatusChange={onStatusFilterChange}
              />
            </div>

            <RolesTable
              query={listQuery}
              data={data}
              isLoading={isLoading}
              isFetching={isFetching}
              onPageChange={onPageChange}
              onViewRole={onViewRole}
              onEditRole={onEditRole}
              onToggleRoleStatus={canUpdate ? onToggleRoleStatus : undefined}
              canUpdate={canUpdate}
              statusActionPendingRoleId={statusMutation.isPending ? (statusMutation.variables?.roleId ?? null) : null}
            />
          </div>
        ) : null}
      </div>

      <RoleDetailSheet roleId={selectedRoleId} open={Boolean(selectedRoleId)} onOpenChange={onDetailOpenChange} />
    </div>
  );
}
