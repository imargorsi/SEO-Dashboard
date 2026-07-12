"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { IoAdd } from "react-icons/io5";

import { TableListSearch } from "@/components/table/table-list-search";
import { TableListSort } from "@/components/table/table-list-sort";
import { UsersTable } from "@/components/users/users-table";
import { Heading } from "@/components/heading";
import { Paragraph } from "@/components/paragraph";
import { buttonVariants } from "@/components/ui/button";
import { useAuthUserQuery } from "@/features/auth/auth.api";
import { useUsersQuery } from "@/features/users/users.api";
import { useQueryParams } from "@/hooks/use-query-params.hook";
import { notify } from "@/lib/frontend/feedback/notify";
import { parseUsersListQuery } from "@/lib/frontend/users/users-list-query.utils";
import { userCanCreate, userCanView } from "@/lib/frontend/users/acl";
import { cn } from "@/lib/utils";

export function UsersListSection() {
  const { t } = useTranslation("translation", { keyPrefix: "modules.users" });
  const { data: authUser, isLoading: isAuthLoading } = useAuthUserQuery();
  const { queryParams, setQueryParams, updateQueryParams, deleteQueryParams } = useQueryParams();
  const listQuery = parseUsersListQuery(queryParams);
  const canCreate = userCanCreate(authUser?.permissions);
  const canView = useMemo(() => userCanView(authUser?.permissions), [authUser]);

  const { data, error, isLoading, isFetching } = useUsersQuery({
    page: listQuery.page,
    per_page: listQuery.per_page,
    search: listQuery.search,
    newest: listQuery.newest,
    enabled: canView,
  });

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
            <Link href="/users/new" className={cn(buttonVariants({ size: "md", variant: "gradient" }))}>
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
            </div>

            <UsersTable
              query={listQuery}
              data={data}
              isLoading={isLoading}
              isFetching={isFetching}
              onPageChange={onPageChange}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
