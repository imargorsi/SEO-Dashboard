import * as React from "react"
import { useTranslation } from "react-i18next"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Inbox,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

export type DataTableColumn<T> = {
  id: string
  header: React.ReactNode
  cell: (row: T, rowIndex: number) => React.ReactNode
  headerClassName?: string
  cellClassName?: string
}

export type DataTableServerPagination = {
  pageIndex: number
  pageSize: number
  totalRows: number
  onPageIndexChange: (pageIndex: number) => void
  onPageSizeChange: (pageSize: number) => void
}

export type DataTableProps<T> = {
  columns: DataTableColumn<T>[]
  data: T[]
  getRowId?: (row: T, index: number) => string | number
  /** Shown above the table (e.g. title). */
  toolbar?: React.ReactNode
  primaryAction?: {
    label: string
    onClick?: () => void
    icon?: React.ReactNode
  }
  formatRowsSelected: (selected: number, total: number) => string
  formatPageOf: (page: number, pageCount: number) => string
  rowsPerPageLabel: string
  firstPageLabel: string
  previousPageLabel: string
  nextPageLabel: string
  lastPageLabel: string
  /** Total for selection footer; defaults to `data.length`. */
  totalRows?: number
  selectedCount?: number
  pageSizeOptions?: number[]
  initialPageSize?: number
  /**
   * Server mode: `data` is already the current page from the API; pagination
   * totals and navigation call through to the parent (e.g. SWR refetch).
   */
  serverPagination?: DataTableServerPagination
  /** When true and there are no rows yet, show loading instead of the empty state. */
  isLoading?: boolean
  /** Override default i18n empty copy (`table.emptyTitle` / `table.emptyBody`). */
  emptyTitle?: string
  emptyDescription?: string
  className?: string
}

export function DataTableCellPill({
  className,
  children,
  empty = "—",
}: {
  className?: string
  children?: React.ReactNode
  empty?: React.ReactNode
}) {
  if (children === null || children === undefined || children === "") {
    return (
      <span className="text-[var(--text-muted)] tabular-nums">{empty}</span>
    )
  }
  return (
    <span
      className={cn(
        "inline-flex max-w-[min(100%,14rem)] truncate rounded-full border border-[var(--border)] bg-[color-mix(in_srgb,var(--social-bg)_92%,var(--bg-elevated))] px-2 py-0.5 text-[11px] font-medium text-[var(--text-h)] shadow-xs dark:border-white/12 dark:bg-white/[0.08] dark:text-white/90",
        className,
      )}
    >
      {children}
    </span>
  )
}

export function DataTable<T>({
  columns,
  data,
  getRowId,
  toolbar,
  primaryAction,
  formatRowsSelected,
  formatPageOf,
  rowsPerPageLabel,
  firstPageLabel,
  previousPageLabel,
  nextPageLabel,
  lastPageLabel,
  totalRows: totalRowsProp,
  selectedCount = 0,
  pageSizeOptions = [10, 20, 50],
  initialPageSize = 10,
  serverPagination,
  isLoading = false,
  emptyTitle: emptyTitleProp,
  emptyDescription: emptyDescriptionProp,
  className,
}: DataTableProps<T>) {
  const { t } = useTranslation("translation", { keyPrefix: "table" })
  const emptyTitle = emptyTitleProp ?? t("emptyTitle")
  const emptyDescription = emptyDescriptionProp ?? t("emptyBody")
  const isServer = serverPagination != null
  const [clientPageSize, setClientPageSize] = React.useState(initialPageSize)
  const [clientPageIndex, setClientPageIndex] = React.useState(0)

  const pageSize = isServer ? serverPagination.pageSize : clientPageSize
  const pageIndex = isServer ? serverPagination.pageIndex : clientPageIndex

  const totalRows = isServer
    ? serverPagination.totalRows
    : (totalRowsProp ?? data.length)

  const pageCount = Math.max(1, Math.ceil(totalRows / pageSize))

  React.useEffect(() => {
    if (isServer) return
    setClientPageIndex(0)
  }, [clientPageSize, isServer])

  React.useEffect(() => {
    if (isServer) return
    setClientPageIndex((p) => Math.min(p, pageCount - 1))
  }, [pageCount, isServer])

  const safePage = Math.min(pageIndex, Math.max(0, pageCount - 1))
  const start = safePage * pageSize
  const pageRows = isServer ? data : data.slice(start, start + pageSize)

  const setPageSize = React.useCallback(
    (n: number) => {
      if (isServer) serverPagination.onPageSizeChange(n)
      else setClientPageSize(n)
    },
    [isServer, serverPagination],
  )

  const goPageIndex = React.useCallback(
    (next: number) => {
      const clamped = Math.min(Math.max(0, next), pageCount - 1)
      if (isServer) serverPagination.onPageIndexChange(clamped)
      else setClientPageIndex(clamped)
    },
    [isServer, pageCount, serverPagination],
  )

  const headerGradient =
    "bg-[linear-gradient(102deg,color-mix(in_srgb,var(--brand)_65%,#312e81)_0%,color-mix(in_srgb,#57534e_80%,var(--text-h))_45%,color-mix(in_srgb,#ca8a04_55%,#92400e)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]"

  return (
    <div
      className={cn(
        "w-full min-w-0 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] shadow-[var(--shadow)]",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] px-3 py-2 sm:px-4">
        <div className="min-w-0 flex-1 text-xs font-medium text-[var(--text-h)] sm:text-sm">
          {toolbar}
        </div>
        {primaryAction ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0 border-[var(--border)] bg-[var(--bg)] text-[var(--text-h)] hover:bg-[var(--accent-bg)]"
            onClick={primaryAction.onClick}
          >
            {primaryAction.icon}
            {primaryAction.label}
          </Button>
        ) : null}
      </div>

      <Table>
        <TableHeader>
          <TableRow
            className={cn(
              "border-0 hover:bg-transparent [&>th]:border-e [&>th]:border-white/15 [&>th]:last:border-e-0",
              headerGradient,
            )}
          >
            {columns.map((col) => (
              <TableHead
                key={col.id}
                className={cn(
                  "h-8 text-[10px] font-bold uppercase tracking-wider text-white/95",
                  col.headerClassName,
                )}
              >
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {pageRows.length > 0 ? (
            pageRows.map((row, i) => {
              const globalIndex = start + i
              const key = getRowId
                ? getRowId(row, globalIndex)
                : globalIndex
              return (
                <TableRow
                  key={String(key)}
                  className="border-[var(--border)] bg-[color-mix(in_srgb,var(--bg-elevated)_100%,var(--text-h)_2%)] hover:bg-[color-mix(in_srgb,var(--accent-bg)_40%,var(--bg-elevated))] dark:bg-[color-mix(in_srgb,var(--bg-elevated)_96%,black)]"
                >
                  {columns.map((col) => (
                    <TableCell
                      key={col.id}
                      className={cn(
                        "text-[var(--text)] first:text-[var(--text-h)]",
                        col.cellClassName,
                      )}
                    >
                      {col.cell(row, globalIndex)}
                    </TableCell>
                  ))}
                </TableRow>
              )
            })
          ) : isLoading ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-28 text-center"
              >
                <div className="flex items-center justify-center gap-2 text-sm text-[var(--text-muted)]">
                  <Spinner className="size-4 shrink-0" />
                  <span>{t("loading")}</span>
                </div>
              </TableCell>
            </TableRow>
          ) : totalRows === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-32 p-6"
              >
                <div className="flex flex-col items-center justify-center gap-2 text-center">
                  <Inbox
                    className="size-9 text-[var(--text-muted)] opacity-70"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                  <p className="text-sm font-medium text-[var(--text-h)]">
                    {emptyTitle}
                  </p>
                  <p className="max-w-md text-xs leading-relaxed text-[var(--text-muted)]">
                    {emptyDescription}
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-16 text-center text-xs text-[var(--text-muted)]"
              >
                —
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="flex flex-col gap-2 border-t border-[var(--border)] bg-[color-mix(in_srgb,var(--social-bg)_35%,var(--bg-elevated))] px-3 py-2 sm:flex-row sm:items-center sm:justify-between sm:px-4 dark:bg-white/[0.03]">
        <p className="text-[11px] text-[var(--text-muted)] tabular-nums">
          {formatRowsSelected(selectedCount, totalRows)}
        </p>
        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5">
            <span className="whitespace-nowrap text-[11px] text-[var(--text-muted)]">
              {rowsPerPageLabel}
            </span>
            <select
              aria-label={rowsPerPageLabel}
              className="h-7 rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-1.5 text-[11px] font-medium text-[var(--text-h)] shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-border)]"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
            >
              {pageSizeOptions.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <p className="text-[11px] text-[var(--text-muted)] tabular-nums">
            {formatPageOf(safePage + 1, pageCount)}
          </p>
          <div className="flex items-center gap-0.5">
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              className="border-[var(--border)]"
              aria-label={firstPageLabel}
              disabled={safePage <= 0}
              onClick={() => goPageIndex(0)}
            >
              <ChevronsLeft className="size-3.5" aria-hidden />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              className="border-[var(--border)]"
              aria-label={previousPageLabel}
              disabled={safePage <= 0}
              onClick={() => goPageIndex(safePage - 1)}
            >
              <ChevronLeft className="size-3.5" aria-hidden />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              className="border-[var(--border)]"
              aria-label={nextPageLabel}
              disabled={safePage >= pageCount - 1}
              onClick={() => goPageIndex(safePage + 1)}
            >
              <ChevronRight className="size-3.5" aria-hidden />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              className="border-[var(--border)]"
              aria-label={lastPageLabel}
              disabled={safePage >= pageCount - 1}
              onClick={() => goPageIndex(pageCount - 1)}
            >
              <ChevronsRight className="size-3.5" aria-hidden />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
