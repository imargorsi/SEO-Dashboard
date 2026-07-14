"use client";

import { useTranslation } from "react-i18next";

import { AppTable } from "@/components/table/app-table";
import { useUsersTableColumns, type TUserTableRow } from "@/hooks/use-users-table-columns.hook";
import { buildUsersPaginationSummary } from "@/lib/frontend/users/users-table.utils";
import type { TUsersListQuery } from "@/lib/frontend/users/users-list-query.utils";
import type { TPaginatedList, TAdminUserListItem } from "@/types/admin-user.types";

type TUsersTableProps = {
  query: TUsersListQuery;
  data?: TPaginatedList<TAdminUserListItem>;
  isLoading: boolean;
  isFetching: boolean;
  onPageChange: (page: number) => void;
  onViewUser?: (user: TAdminUserListItem) => void;
  onEditUser?: (user: TAdminUserListItem) => void;
  onToggleUserStatus?: (user: TAdminUserListItem) => void;
  canUpdate?: boolean;
  statusActionPendingUserId?: string | null;
};

export function UsersTable({
  query,
  data,
  isLoading,
  isFetching,
  onPageChange,
  onViewUser,
  onEditUser,
  onToggleUserStatus,
  canUpdate,
  statusActionPendingUserId,
}: TUsersTableProps) {
  const { t: tTable } = useTranslation("translation", { keyPrefix: "modules.users.table" });
  const columns = useUsersTableColumns({
    onViewUser,
    onEditUser,
    onToggleUserStatus,
    canUpdate,
    statusActionPendingUserId,
  });

  const items = (data?.items ?? []) as TUserTableRow[];
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
        summaryLabel: buildUsersPaginationSummary(query.page, query.per_page, total, ({ from, to, total: count }) =>
          tTable("showingUsers", { from, to, total: count }),
        ),
        previousPageLabel: tTable("previousPage"),
        nextPageLabel: tTable("nextPage"),
        pageNumberLabel: (page) => tTable("pageNumber", { page }),
      }}
    />
  );
}
