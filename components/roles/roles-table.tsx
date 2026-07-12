"use client";

import { useTranslation } from "react-i18next";

import { AppTable } from "@/components/table/app-table";
import { useRolesTableColumns, type TRoleTableRow } from "@/hooks/use-roles-table-columns.hook";
import { buildRolesPaginationSummary } from "@/lib/frontend/roles/roles-table.utils";
import type { TRolesListQuery } from "@/lib/frontend/roles/roles-list-query.utils";
import type { TPaginatedRoleList } from "@/types/admin-role.types";

type TRolesTableProps = {
  query: TRolesListQuery;
  data?: TPaginatedRoleList;
  isLoading: boolean;
  isFetching: boolean;
  onPageChange: (page: number) => void;
};

export function RolesTable({ query, data, isLoading, isFetching, onPageChange }: TRolesTableProps) {
  const { t: tTable } = useTranslation("translation", { keyPrefix: "modules.roles.table" });
  const columns = useRolesTableColumns();

  const items = (data?.items ?? []) as TRoleTableRow[];
  const total = data?.pagination.total ?? 0;

  return (
    <AppTable
      columns={columns}
      data={items}
      getRowId={(item) => item.id}
      isLoading={isLoading && !data}
      isFetching={isFetching}
      loadingLabel={tTable("loading")}
      updatingLabel={tTable("updating")}
      emptyTitle={tTable("emptyTitle")}
      emptyBody={tTable("emptyBody")}
      pagination={{
        page: query.page,
        perPage: query.per_page,
        total,
        onPageChange,
        summaryLabel: buildRolesPaginationSummary(query.page, query.per_page, total, ({ from, to, total: count }) =>
          tTable("showingRoles", { from, to, total: count }),
        ),
        previousPageLabel: tTable("previousPage"),
        nextPageLabel: tTable("nextPage"),
        pageNumberLabel: (page) => tTable("pageNumber", { page }),
      }}
    />
  );
}
