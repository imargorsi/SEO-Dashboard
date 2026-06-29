import { Fragment, useCallback, useEffect, useMemo, useState, type ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import useSWR from "swr"
import {
  AlertCircle,
  CheckCircle2,
  KeyRound,
  MoreVertical,
  Pencil,
  Plus,
} from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ADMIN_PERMISSIONS_ENDPOINT,
  type AdminPermissionDeleteResponse,
  type AdminPermissionsResponse,
  adminPermissionPath,
} from "@/lib/admin/permissions.types"
import { api } from "@/lib/api"
import { DataTable, DataTableCellPill, type DataTableColumn } from "./DataTable"

function DetailField({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
        {label}
      </p>
      <div className="min-w-0 text-sm leading-relaxed text-[var(--text)]">
        {children}
      </div>
    </div>
  )
}

export type PermissionTableRow = {
  id: number
  name: string
  rolesCount: number
}

export type PermissionsTableFeedback = {
  variant: "default" | "destructive"
  title: string
  description: string
}

type PermissionsTableProps = {
  initialFeedback?: PermissionsTableFeedback | null
}

export function PermissionsTable({ initialFeedback = null }: PermissionsTableProps) {
  const { t } = useTranslation("translation", {
    keyPrefix: "modules.permissions",
  })
  const navigate = useNavigate()
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(15)
  const [deleteTarget, setDeleteTarget] = useState<PermissionTableRow | null>(null)
  const [deleteSubmitting, setDeleteSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<PermissionsTableFeedback | null>(
    initialFeedback,
  )
  const [detailRow, setDetailRow] = useState<PermissionTableRow | null>(null)

  const swrKey = useMemo(
    () =>
      [
        ADMIN_PERMISSIONS_ENDPOINT,
        { page: pageIndex + 1, per_page: pageSize },
      ] as const,
    [pageIndex, pageSize],
  )

  const { data, error, isLoading, isValidating, mutate } =
    useSWR<AdminPermissionsResponse>(swrKey)

  useEffect(() => {
    if (!data?.success) return
    const last = data.data.pagination.last_page
    setPageIndex((p) => (p + 1 > last ? Math.max(0, last - 1) : p))
  }, [data])

  const rows: PermissionTableRow[] = useMemo(() => {
    if (!data?.success) return []
    return data.data.items.map((item) => ({
      id: item.id,
      name: item.name,
      rolesCount: item.roles_count,
    }))
  }, [data])

  const goToEdit = useCallback(
    (row: PermissionTableRow) => {
      navigate(`/permissions/${row.id}/edit`, { state: { permission: row } })
    },
    [navigate],
  )

  const totalRows = data?.success ? data.data.pagination.total : 0

  const onPageSizeChange = useCallback((next: number) => {
    setPageSize(next)
    setPageIndex(0)
  }, [])

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return
    setDeleteSubmitting(true)
    try {
      const json = await api.delete<AdminPermissionDeleteResponse>(
        adminPermissionPath(deleteTarget.id),
      )
      const apiMsg =
        typeof json.message === "string" && json.message.trim()
          ? json.message.trim()
          : null
      setDeleteTarget(null)
      if (json.success) {
        setFeedback({
          variant: "default",
          title: t("table.deleteSuccessTitle"),
          description: apiMsg ?? t("table.deleteSuccessFallback"),
        })
        await mutate()
      } else {
        setFeedback({
          variant: "destructive",
          title: t("table.deleteErrorTitle"),
          description: apiMsg ?? t("table.loadErrorBody"),
        })
      }
    } catch (e) {
      setDeleteTarget(null)
      setFeedback({
        variant: "destructive",
        title: t("table.deleteErrorTitle"),
        description:
          e instanceof Error ? e.message : t("table.loadErrorBody"),
      })
    } finally {
      setDeleteSubmitting(false)
    }
  }, [deleteTarget, mutate, t])

  const columns = useMemo<DataTableColumn<PermissionTableRow>[]>(
    () => [
      {
        id: "id",
        header: t("table.colId"),
        cellClassName: "font-mono text-[11px]",
        cell: (row) => String(row.id),
      },
      {
        id: "name",
        header: t("table.colName"),
        cell: (row) => <DataTableCellPill>{row.name}</DataTableCellPill>,
      },
      {
        id: "roles_count",
        header: t("table.colRoles"),
        cellClassName: "tabular-nums",
        cell: (row) => (
          <DataTableCellPill>{String(row.rolesCount)}</DataTableCellPill>
        ),
      },
      {
        id: "actions",
        header: t("table.colActions"),
        headerClassName: "text-end",
        cellClassName: "text-end",
        cell: (row) => (
          <div className="inline-flex items-center justify-end gap-0.5">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="text-[var(--text-h)] hover:bg-[var(--accent-bg)]"
              aria-label={t("table.edit")}
              onClick={() => goToEdit(row)}
            >
              <Pencil className="size-3.5" aria-hidden />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="text-[var(--text-h)] hover:bg-[var(--accent-bg)]"
                  aria-label={t("table.more")}
                >
                  <MoreVertical className="size-3.5" aria-hidden />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[10rem]">
                <DropdownMenuItem onSelect={() => setDetailRow(row)}>
                  {t("table.moreView")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={() => setDeleteTarget(row)}
                >
                  {t("table.delete")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    [goToEdit, t],
  )

  const toolbar = (
    <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[var(--text-muted)]">
      <span>{t("table.toolbarHint")}</span>
      {(isLoading && !data) || isValidating ? (
        <span className="text-[var(--text-h)]">{t("table.updating")}</span>
      ) : null}
    </span>
  )

  return (
    <Fragment>
      <div className="flex w-full min-w-0 flex-col gap-3">
        {error ? (
          <Alert variant="destructive">
            <AlertCircle className="size-4" aria-hidden />
            <AlertTitle>{t("table.loadErrorTitle")}</AlertTitle>
            <AlertDescription>
              {error instanceof Error ? error.message : t("table.loadErrorBody")}
            </AlertDescription>
          </Alert>
        ) : null}
        {feedback ? (
          <Alert variant={feedback.variant}>
            {feedback.variant === "destructive" ? (
              <AlertCircle className="size-4" aria-hidden />
            ) : (
              <CheckCircle2
                className="size-4 text-emerald-600 dark:text-emerald-400"
                aria-hidden
              />
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
          primaryAction={{
            label: t("table.createPermission"),
            icon: <Plus className="size-3.5" strokeWidth={2.25} aria-hidden />,
            onClick: () => navigate("/permissions/new"),
          }}
          formatRowsSelected={(selected, total) =>
            t("table.rowsSelected", { selected, total })
          }
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
          if (!open && !deleteSubmitting) setDeleteTarget(null)
        }}
      >
        <AlertDialogContent
          className="gap-5 border-[var(--border)] sm:max-w-md"
          onEscapeKeyDown={(e) => {
            if (deleteSubmitting) e.preventDefault()
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>{t("table.deleteConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription className="text-pretty">
              {deleteTarget
                ? t("table.deleteConfirmDescription", {
                    name: deleteTarget.name,
                  })
                : "\u00a0"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-2">
            <AlertDialogCancel disabled={deleteSubmitting}>
              {t("table.deleteConfirmCancel")}
            </AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteSubmitting}
              onClick={() => void confirmDelete()}
            >
              {deleteSubmitting
                ? t("table.deleteInProgress")
                : t("table.deleteConfirmAction")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Sheet
        open={detailRow != null}
        onOpenChange={(open) => {
          if (!open) setDetailRow(null)
        }}
      >
        <SheetContent side="right" className="gap-0 overflow-hidden p-0 sm:max-w-md">
          <SheetHeader>
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text-h)] shadow-xs">
                <KeyRound className="size-5" strokeWidth={2} aria-hidden />
              </span>
              <div className="min-w-0 flex-1 space-y-0.5">
                <SheetTitle className="line-clamp-2 text-balance">
                  {detailRow?.name ?? "—"}
                </SheetTitle>
                <SheetDescription>{t("table.detailSheetLead")}</SheetDescription>
              </div>
            </div>
          </SheetHeader>
          <div className="flex max-h-[calc(100vh-8rem)] flex-col gap-5 overflow-y-auto px-5 py-5">
            <DetailField label={t("table.colId")}>
              <span className="font-mono text-[13px] tabular-nums">
                {detailRow ? String(detailRow.id) : "—"}
              </span>
            </DetailField>
            <DetailField label={t("table.colRoles")}>
              <span className="font-mono text-[13px] tabular-nums">
                {detailRow ? String(detailRow.rolesCount) : "—"}
              </span>
            </DetailField>
          </div>
        </SheetContent>
      </Sheet>
    </Fragment>
  )
}
