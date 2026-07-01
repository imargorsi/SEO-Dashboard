"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { IoAdd, IoAlertCircle, IoMail } from "react-icons/io5";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { DataTable, DataTableCellPill, type DataTableColumn } from "@/components/table/data-table";
import { useUsersQuery } from "@/features/users/users.api";
import { useAuthUserQuery } from "@/features/auth/auth.api";
import { userCanCreate, userCanView } from "@/lib/frontend/users/acl";

export type UserTableRow = {
  id: string;
  name: string;
  email: string;
  companyName: string | null;
  roles: string[];
  verified: boolean;
};

export function UsersTable() {
  const { t } = useTranslation("translation", { keyPrefix: "modules.users" });
  const router = useRouter();
  const { data: authUser } = useAuthUserQuery();

  const canView = useMemo(() => userCanView(authUser?.permissions), [authUser]);
  const canCreate = useMemo(() => userCanCreate(authUser?.permissions), [authUser]);

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(15);

  const { data, error, isLoading, isFetching } = useUsersQuery({
    page: pageIndex + 1,
    per_page: pageSize,
  });

  const rows: UserTableRow[] = useMemo(() => {
    if (!data) return [];
    return data.items.map((item) => ({
      id: item.id,
      name: item.name,
      email: item.email,
      companyName: item.company_name,
      roles: item.roles,
      verified: Boolean(item.email_verified_at),
    }));
  }, [data]);

  const totalRows = data?.pagination.total ?? 0;

  const columns = useMemo<DataTableColumn<UserTableRow>[]>(
    () => [
      {
        id: "name",
        header: t("table.colName"),
        cell: (row) => <DataTableCellPill>{row.name}</DataTableCellPill>,
      },
      {
        id: "email",
        header: t("table.colEmail"),
        cell: (row) => (
          <DataTableCellPill className="max-w-[min(100%,20rem)] p-0">
            <a
              href={`mailto:${row.email}`}
              className="inline-flex max-w-full items-center gap-1.5 truncate px-2 py-0.5 text-[var(--text-h)] underline-offset-2 hover:underline"
            >
              <IoMail className="size-3 shrink-0 text-[#EA4335]" strokeWidth={2.25} aria-hidden />
              <span className="truncate">{row.email}</span>
            </a>
          </DataTableCellPill>
        ),
      },
      {
        id: "company",
        header: t("table.colCompany"),
        cell: (row) => <DataTableCellPill>{row.companyName}</DataTableCellPill>,
      },
      {
        id: "roles",
        header: t("table.colRoles"),
        cell: (row) => (
          <DataTableCellPill className="gap-1 p-0">
            {row.roles.map((role) => (
              <Badge key={role} variant="outline" className="mx-0.5 capitalize">
                {role.replace(/_/g, " ")}
              </Badge>
            ))}
          </DataTableCellPill>
        ),
      },
      {
        id: "verified",
        header: t("table.colVerified"),
        cell: (row) => (
          <DataTableCellPill className="p-0">
            {row.verified ? (
              <Badge variant="success">{t("table.verifiedYes")}</Badge>
            ) : (
              <Badge variant="outline">{t("table.verifiedNo")}</Badge>
            )}
          </DataTableCellPill>
        ),
      },
    ],
    [t]
  );

  if (!canView) {
    return (
      <Alert variant="destructive">
        <IoAlertCircle className="size-4 shrink-0" aria-hidden />
        <AlertTitle>{t("table.accessDeniedTitle")}</AlertTitle>
        <AlertDescription>{t("table.accessDeniedBody")}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-3">
      {error ? (
        <Alert variant="destructive">
          <IoAlertCircle className="size-4" aria-hidden />
          <AlertTitle>{t("table.loadErrorTitle")}</AlertTitle>
          <AlertDescription>{error instanceof Error ? error.message : t("table.loadErrorBody")}</AlertDescription>
        </Alert>
      ) : null}
      <DataTable
        columns={columns}
        data={rows}
        getRowId={(row) => row.id}
        isLoading={isLoading && !data}
        toolbar={
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[var(--text-muted)]">
            <span>{t("table.toolbarHint")}</span>
            {(isLoading && !data) || isFetching ? (
              <span className="text-[var(--text-h)]">{t("table.updating")}</span>
            ) : null}
          </span>
        }
        primaryAction={
          canCreate
            ? {
                label: t("table.createUser"),
                icon: <IoAdd className="size-3.5" strokeWidth={2.25} aria-hidden />,
                onClick: () => router.push("/users/new"),
              }
            : undefined
        }
        formatRowsSelected={(selected, total) => t("table.rowsSelected", { selected, total })}
        formatPageOf={(page, count) => t("table.pageOf", { page, count })}
        rowsPerPageLabel={t("table.rowsPerPage")}
        firstPageLabel={t("table.firstPage")}
        previousPageLabel={t("table.previousPage")}
        nextPageLabel={t("table.nextPage")}
        lastPageLabel={t("table.lastPage")}
        pageSizeOptions={[10, 15, 20, 50]}
        initialPageSize={15}
        serverPagination={{
          pageIndex,
          pageSize,
          totalRows,
          onPageIndexChange: setPageIndex,
          onPageSizeChange: (next) => {
            setPageSize(next);
            setPageIndex(0);
          },
        }}
      />
    </div>
  );
}
