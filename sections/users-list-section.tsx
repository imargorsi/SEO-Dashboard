"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { IoAdd } from "react-icons/io5";

import { TableListSearch } from "@/components/table/table-list-search";
import { TableListSort } from "@/components/table/table-list-sort";
import { UserDetailSheet } from "@/components/users/user-detail-sheet";
import { UserStatusFilter } from "@/components/users/user-status-filter";
import { UsersTable } from "@/components/users/users-table";
import { Heading } from "@/components/heading";
import { Paragraph } from "@/components/paragraph";
import { buttonVariants } from "@/components/ui/button";
import { useAuthUserQuery } from "@/features/auth/auth.api";
import { useUserStatusActionMutation, useUsersQuery } from "@/features/users/users.api";
import { useQueryParams } from "@/hooks/use-query-params.hook";
import { ApiError } from "@/lib/frontend/api/errors";
import { notify } from "@/lib/frontend/feedback/notify";
import { parseUsersListQuery } from "@/lib/frontend/users/users-list-query.utils";
import { userCanCreate, userCanUpdate, userCanView } from "@/lib/frontend/users/acl";
import { USER_ROUTES } from "@/lib/frontend/users/user-routes.utils";
import { isActiveUserStatus, type TUserAccountStatus } from "@/lib/users/constants";
import { EMPTY_USER_STATUS_COUNTS } from "@/lib/users/user-status-filter.utils";
import type { TAdminUserListItem } from "@/types/admin-user.types";
import { cn } from "@/lib/utils";

export function UsersListSection() {
  const router = useRouter();
  const { t } = useTranslation("translation", { keyPrefix: "modules.users" });
  const { data: authUser, isLoading: isAuthLoading } = useAuthUserQuery();
  const { queryParams, setQueryParams, updateQueryParams, deleteQueryParams } = useQueryParams();
  const listQuery = parseUsersListQuery(queryParams);
  const canView = useMemo(() => userCanView(authUser?.permissions), [authUser]);
  const canCreate = useMemo(() => userCanCreate(authUser?.permissions), [authUser]);
  const canUpdate = useMemo(() => userCanUpdate(authUser?.permissions), [authUser]);
  const [selectedUser, setSelectedUser] = useState<TAdminUserListItem | null>(null);
  const statusMutation = useUserStatusActionMutation();

  const { data, error, isLoading, isFetching } = useUsersQuery({
    page: listQuery.page,
    per_page: listQuery.per_page,
    search: listQuery.search,
    newest: listQuery.newest,
    status: listQuery.status,
    enabled: canView,
  });

  const statusCounts = data?.filters.status_counts ?? EMPTY_USER_STATUS_COUNTS;

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
    [t],
  );

  const onSearchChange = useCallback(
    (value: string) => {
      if (value) {
        updateQueryParams({ search: value }, ["page"]);
        return;
      }

      updateQueryParams({}, ["search", "page"]);
    },
    [updateQueryParams],
  );

  const onNewestChange = useCallback(
    (value: string) => {
      if (value === "newest") {
        deleteQueryParams(["newest"]);
        return;
      }

      setQueryParams({ newest: "false" });
    },
    [deleteQueryParams, setQueryParams],
  );

  const onStatusFilterChange = useCallback(
    (nextStatus: TUserAccountStatus | null) => {
      if (!nextStatus) {
        updateQueryParams({}, ["status", "page"]);
        return;
      }

      updateQueryParams({ status: nextStatus }, ["page"]);
    },
    [updateQueryParams],
  );

  const onPageChange = useCallback(
    (page: number) => {
      if (page <= 1) {
        deleteQueryParams(["page"]);
        return;
      }

      setQueryParams({ page: String(page) });
    },
    [deleteQueryParams, setQueryParams],
  );

  const onViewUser = useCallback((user: TAdminUserListItem) => {
    setSelectedUser(user);
  }, []);

  const onEditUser = useCallback(
    (user: TAdminUserListItem) => {
      router.push(USER_ROUTES.edit(user.id));
    },
    [router],
  );

  const onToggleUserStatus = useCallback(
    async (user: TAdminUserListItem) => {
      const action = isActiveUserStatus(user.status) ? "deactivate" : "activate";
      try {
        const result = await statusMutation.mutateAsync({ userId: user.id, action });
        notify.success(
          result.message?.trim() ||
            t(action === "activate" ? "table.activateSuccess" : "table.deactivateSuccess"),
        );
        setSelectedUser((current) =>
          current?.id === user.id ? { ...current, status: result.data.status } : current,
        );
      } catch (error) {
        notify.error(ApiError.messageFrom(error, t("table.statusActionError")));
      }
    },
    [statusMutation, t],
  );

  const onDetailOpenChange = useCallback((open: boolean) => {
    if (!open) setSelectedUser(null);
  }, []);

  return (
    <div className="w-full min-w-0">
      <div className="space-y-5 px-4 py-6 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <Heading id="users-list-title" pageTitle>
              {t("title")}
            </Heading>
            <Paragraph className="text-text-muted">{t("subtitle")}</Paragraph>
          </div>

          {canCreate ? (
            <Link href={USER_ROUTES.create} className={cn(buttonVariants({ size: "md", variant: "gradient" }))}>
              <IoAdd className="size-4" aria-hidden />
              {t("table.createUser")}
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
              <UserStatusFilter
                activeStatus={listQuery.status}
                counts={statusCounts}
                onStatusChange={onStatusFilterChange}
              />
            </div>

            <UsersTable
              query={listQuery}
              data={data}
              isLoading={isLoading}
              isFetching={isFetching}
              onPageChange={onPageChange}
              onViewUser={onViewUser}
              onEditUser={onEditUser}
              onToggleUserStatus={canUpdate ? onToggleUserStatus : undefined}
              canUpdate={canUpdate}
              statusActionPendingUserId={
                statusMutation.isPending ? (statusMutation.variables?.userId ?? null) : null
              }
            />
          </div>
        ) : null}
      </div>

      <UserDetailSheet
        user={selectedUser}
        open={Boolean(selectedUser)}
        onOpenChange={onDetailOpenChange}
      />
    </div>
  );
}
