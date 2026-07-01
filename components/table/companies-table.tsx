"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  IoAdd,
  IoAlertCircle,
  IoBusiness,
  IoCheckmarkCircle,
  IoEllipsisVertical,
  IoMail,
  IoPencil,
} from "react-icons/io5";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import { DataTable, DataTableCellPill, type DataTableColumn } from "@/components/table/data-table";
import {
  useApproveCompanyMutation,
  useCompaniesQuery,
  useDeleteCompanyMutation,
} from "@/features/companies/companies.api";
import { useAuthUserQuery } from "@/features/auth/auth.api";
import {
  companyCanCreate,
  companyCanDelete,
  companyCanUpdate,
  companyCanView,
} from "@/lib/frontend/companies/acl";
import { companyProjectsCanCreate } from "@/lib/frontend/companies/projects-acl";
import type { CompanyRegistrationStatus } from "@/lib/dummy-data";

export type CompanyTableRow = {
  id: string;
  name: string;
  pocName: string | null;
  pocEmail: string | null;
  statusActive: boolean;
  registrationStatus: CompanyRegistrationStatus;
};

export type TableFeedback = {
  variant: "default" | "destructive";
  title: string;
  description: string;
};

function statusActiveFromItem(isActive?: boolean): boolean {
  if (typeof isActive === "boolean") return isActive;
  return true;
}

function registrationStatusFromItem(status?: string): CompanyRegistrationStatus {
  const raw = status?.trim().toLowerCase();
  if (raw === "approved") return "approved";
  return "pending";
}

function DetailField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">{label}</p>
      <div className="min-w-0 text-sm leading-relaxed text-[var(--text)]">{children}</div>
    </div>
  );
}

export function CompaniesTable() {
  const { t } = useTranslation("translation", { keyPrefix: "modules.companies" });
  const router = useRouter();
  const { data: authUser } = useAuthUserQuery();

  const { canCreate, canUpdate, canDelete, canViewDetail, canSeeCompanyProjects } = useMemo(() => {
    const p = authUser?.permissions ?? [];
    return {
      canCreate: companyCanCreate(p),
      canUpdate: companyCanUpdate(p),
      canDelete: companyCanDelete(p),
      canViewDetail: companyCanView(p),
      canSeeCompanyProjects: companyProjectsCanCreate(p),
    };
  }, [authUser]);

  const showActionsColumn = canUpdate || canViewDetail || canDelete;
  const showRowMenu = canViewDetail || canDelete;

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const [deleteTarget, setDeleteTarget] = useState<CompanyTableRow | null>(null);
  const [feedback, setFeedback] = useState<TableFeedback | null>(null);
  const [detailRow, setDetailRow] = useState<CompanyTableRow | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("companies-list-feedback");
    if (!raw) return;
    sessionStorage.removeItem("companies-list-feedback");
    try {
      setFeedback(JSON.parse(raw) as TableFeedback);
    } catch {
      /* ignore malformed feedback */
    }
  }, []);

  const { data, error, isLoading, isFetching } = useCompaniesQuery({
    page: pageIndex + 1,
    per_page: pageSize,
  });

  const deleteMutation = useDeleteCompanyMutation();
  const approveMutation = useApproveCompanyMutation();

  useEffect(() => {
    if (!data) return;
    const last = data.pagination.last_page;
    setPageIndex((p) => (p + 1 > last ? Math.max(0, last - 1) : p));
  }, [data]);

  const rows: CompanyTableRow[] = useMemo(() => {
    if (!data) return [];
    return data.items.map((item) => ({
      id: item.id,
      name: item.name,
      pocName: item.poc_name,
      pocEmail: item.poc_email,
      statusActive: statusActiveFromItem(item.is_active),
      registrationStatus: registrationStatusFromItem(item.status),
    }));
  }, [data]);

  const approveCompany = useCallback(
    async (row: CompanyTableRow) => {
      if (row.registrationStatus !== "pending") return;
      setApprovingId(row.id);
      try {
        await approveMutation.mutateAsync(row.id);
        setFeedback({
          variant: "default",
          title: t("table.approveSuccessTitle"),
          description: t("table.approveSuccessFallback"),
        });
      } catch (e) {
        setFeedback({
          variant: "destructive",
          title: t("table.approveErrorTitle"),
          description: e instanceof Error ? e.message : t("table.loadErrorBody"),
        });
      } finally {
        setApprovingId(null);
      }
    },
    [approveMutation, t]
  );

  const goToEdit = useCallback(
    (row: CompanyTableRow) => {
      router.push(`/companies/${row.id}/edit`);
    },
    [router]
  );

  const totalRows = data?.pagination.total ?? 0;

  const onPageSizeChange = useCallback((next: number) => {
    setPageSize(next);
    setPageIndex(0);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
      setFeedback({
        variant: "default",
        title: t("table.deleteSuccessTitle"),
        description: t("table.deleteSuccessFallback"),
      });
    } catch (e) {
      setDeleteTarget(null);
      setFeedback({
        variant: "destructive",
        title: t("table.deleteErrorTitle"),
        description: e instanceof Error ? e.message : t("table.loadErrorBody"),
      });
    }
  }, [deleteTarget, deleteMutation, t]);

  const columns = useMemo<DataTableColumn<CompanyTableRow>[]>(() => {
    const cols: DataTableColumn<CompanyTableRow>[] = [
      {
        id: "id",
        header: t("table.colId"),
        cellClassName: "font-mono text-[11px]",
        cell: (row) => row.id.slice(-6),
      },
      {
        id: "name",
        header: t("table.colName"),
        cell: (row) => <DataTableCellPill>{row.name}</DataTableCellPill>,
      },
      {
        id: "poc_name",
        header: t("table.colPocName"),
        cell: (row) => <DataTableCellPill>{row.pocName}</DataTableCellPill>,
      },
      {
        id: "poc_email",
        header: t("table.colEmail"),
        cell: (row) => {
          const email = row.pocEmail?.trim();
          if (!email) return <DataTableCellPill>{null}</DataTableCellPill>;
          return (
            <DataTableCellPill className="max-w-[min(100%,20rem)] p-0">
              <a
                href={`mailto:${email}`}
                className="inline-flex max-w-full items-center gap-1.5 truncate px-2 py-0.5 text-[var(--text-h)] underline-offset-2 hover:underline"
              >
                <IoMail className="size-3 shrink-0 text-[#EA4335]" strokeWidth={2.25} aria-hidden />
                <span className="truncate">{email}</span>
              </a>
            </DataTableCellPill>
          );
        },
      },
      {
        id: "status",
        header: t("table.colStatus"),
        cell: (row) => (
          <DataTableCellPill className="p-0">
            {row.statusActive ? (
              <Badge variant="success">{t("table.statusActive")}</Badge>
            ) : (
              <Badge
                variant="outline"
                className="border-red-500/35 bg-red-500/12 font-semibold uppercase tracking-wide text-red-800 dark:text-red-200"
              >
                {t("table.statusInactive")}
              </Badge>
            )}
          </DataTableCellPill>
        ),
      },
      {
        id: "registered",
        header: t("table.colRegistered"),
        cell: (row) => (
          <DataTableCellPill className="p-0">
            {row.registrationStatus === "pending" ? (
              <button
                type="button"
                disabled={approvingId === row.id}
                aria-busy={approvingId === row.id}
                aria-label={t("table.approvePendingAria", { name: row.name })}
                title={t("table.approvePendingHint")}
                onClick={() => void approveCompany(row)}
                className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-900 transition-colors hover:bg-amber-500/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)] disabled:cursor-wait disabled:opacity-70 dark:text-amber-100"
              >
                {approvingId === row.id ? <Spinner className="size-2.5 shrink-0" /> : null}
                {t("table.registeredPending")}
              </button>
            ) : (
              <Badge variant="success">{t("table.registeredApproved")}</Badge>
            )}
          </DataTableCellPill>
        ),
      },
    ];

    if (canSeeCompanyProjects) {
      cols.push({
        id: "projects",
        header: t("table.colProjects"),
        headerClassName: "text-end",
        cellClassName: "text-end",
        cell: (row) => (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-[11px]"
            onClick={() => router.push(`/companies/${row.id}/projects`)}
          >
            {t("table.seeProjects")}
          </Button>
        ),
      });
    }

    if (showActionsColumn) {
      cols.push({
        id: "actions",
        header: t("table.colActions"),
        headerClassName: "text-end",
        cellClassName: "text-end",
        cell: (row) => (
          <div className="inline-flex items-center justify-end gap-0.5">
            {canUpdate ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="text-[var(--text-h)] hover:bg-[var(--accent-bg)]"
                aria-label={t("table.edit")}
                onClick={() => goToEdit(row)}
              >
                <IoPencil className="size-3.5" aria-hidden />
              </Button>
            ) : null}
            {showRowMenu ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="text-[var(--text-h)] hover:bg-[var(--accent-bg)]"
                    aria-label={t("table.more")}
                  >
                    <IoEllipsisVertical className="size-3.5" aria-hidden />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[10rem]">
                  {canViewDetail ? (
                    <DropdownMenuItem onSelect={() => setDetailRow(row)}>{t("table.moreView")}</DropdownMenuItem>
                  ) : null}
                  {canDelete ? (
                    <DropdownMenuItem variant="destructive" onSelect={() => setDeleteTarget(row)}>
                      {t("table.delete")}
                    </DropdownMenuItem>
                  ) : null}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </div>
        ),
      });
    }

    return cols;
  }, [
    approveCompany,
    approvingId,
    goToEdit,
    router,
    t,
    canSeeCompanyProjects,
    showActionsColumn,
    showRowMenu,
    canUpdate,
    canDelete,
    canViewDetail,
  ]);

  const toolbar = (
    <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[var(--text-muted)]">
      <span>{t("table.toolbarHint")}</span>
      {(isLoading && !data) || isFetching ? (
        <span className="text-[var(--text-h)]">{t("table.updating")}</span>
      ) : null}
    </span>
  );

  return (
    <Fragment>
      <div className="flex w-full min-w-0 flex-col gap-3">
        {error ? (
          <Alert variant="destructive">
            <IoAlertCircle className="size-4" aria-hidden />
            <AlertTitle>{t("table.loadErrorTitle")}</AlertTitle>
            <AlertDescription>
              {error instanceof Error ? error.message : t("table.loadErrorBody")}
            </AlertDescription>
          </Alert>
        ) : null}
        {feedback ? (
          <Alert variant={feedback.variant}>
            {feedback.variant === "destructive" ? (
              <IoAlertCircle className="size-4" aria-hidden />
            ) : (
              <IoCheckmarkCircle className="size-4 text-emerald-600 dark:text-emerald-400" aria-hidden />
            )}
            <AlertTitle>{feedback.title}</AlertTitle>
            <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <span className="min-w-0 flex-1">{feedback.description}</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0 self-start sm:self-auto"
                onClick={() => setFeedback(null)}
              >
                {t("table.dismiss")}
              </Button>
            </AlertDescription>
          </Alert>
        ) : null}
        <DataTable
          columns={columns}
          data={rows}
          getRowId={(row) => row.id}
          isLoading={isLoading && !data}
          toolbar={toolbar}
          primaryAction={
            canCreate
              ? {
                  label: t("table.createCompany"),
                  icon: <IoAdd className="size-3.5" strokeWidth={2.25} aria-hidden />,
                  onClick: () => router.push("/companies/new"),
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
            onPageSizeChange,
          }}
        />
      </div>

      <AlertDialog
        open={deleteTarget != null}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent
          className="gap-5 border-[var(--border)] sm:max-w-md"
          onEscapeKeyDown={(e) => {
            if (deleteMutation.isPending) e.preventDefault();
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>{t("table.deleteConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription className="text-pretty">
              {deleteTarget ? t("table.deleteConfirmDescription", { name: deleteTarget.name }) : "\u00a0"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-2">
            <AlertDialogCancel disabled={deleteMutation.isPending}>{t("table.deleteConfirmCancel")}</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => void confirmDelete()}
            >
              {deleteMutation.isPending ? t("table.deleteInProgress") : t("table.deleteConfirmAction")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Sheet open={detailRow != null} onOpenChange={(open) => !open && setDetailRow(null)}>
        <SheetContent side="right" className="gap-0 overflow-hidden p-0 sm:max-w-md">
          <SheetHeader>
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text-h)] shadow-xs">
                <IoBusiness className="size-5" strokeWidth={2} aria-hidden />
              </span>
              <div className="min-w-0 flex-1 space-y-0.5">
                <SheetTitle className="line-clamp-2 text-balance">{detailRow?.name ?? "—"}</SheetTitle>
                <SheetDescription>{t("table.detailSheetLead")}</SheetDescription>
              </div>
            </div>
          </SheetHeader>
          <div className="flex max-h-[calc(100vh-8rem)] flex-col gap-5 overflow-y-auto px-5 py-5">
            <DetailField label={t("table.colId")}>
              <span className="font-mono text-[13px] tabular-nums">{detailRow?.id ?? "—"}</span>
            </DetailField>
            <DetailField label={t("table.colPocName")}>
              {detailRow?.pocName?.trim() ? (
                <span>{detailRow.pocName}</span>
              ) : (
                <span className="text-[var(--text-muted)]">—</span>
              )}
            </DetailField>
            <DetailField label={t("table.colEmail")}>
              {detailRow?.pocEmail?.trim() ? (
                <a
                  href={`mailto:${detailRow.pocEmail.trim()}`}
                  className="inline-flex items-center gap-2 font-medium text-[var(--text-h)] underline-offset-2 hover:underline"
                >
                  <IoMail className="size-3.5 shrink-0 text-[#EA4335]" strokeWidth={2.25} aria-hidden />
                  {detailRow.pocEmail.trim()}
                </a>
              ) : (
                <span className="text-[var(--text-muted)]">—</span>
              )}
            </DetailField>
            <DetailField label={t("table.colStatus")}>
              {detailRow ? (
                detailRow.statusActive ? (
                  <Badge variant="success">{t("table.statusActive")}</Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="border-red-500/35 bg-red-500/12 font-semibold uppercase tracking-wide text-red-800 dark:text-red-200"
                  >
                    {t("table.statusInactive")}
                  </Badge>
                )
              ) : (
                <span className="text-[var(--text-muted)]">—</span>
              )}
            </DetailField>
          </div>
        </SheetContent>
      </Sheet>
    </Fragment>
  );
}
