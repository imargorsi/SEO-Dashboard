import { Fragment, useCallback, useEffect, useMemo, useState, type ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import useSWR from "swr"
import {
  AlertCircle,
  CheckCircle2,
  FolderKanban,
  Globe,
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
  PROJECTS_ENDPOINT,
  type ProjectDeleteResponse,
  type ProjectItem,
  type ProjectsResponse,
  projectPath,
} from "@/lib/admin/projects.types"
import {
  projectCanCreate,
  projectCanDelete,
  projectCanUpdate,
  projectCanView,
} from "@/lib/admin/projectsAcl"
import { api } from "@/lib/api"
import { useAuthUser } from "@/hooks/useAuthUser"
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

function formatBusinessType(
  isB2b: boolean | null,
  isB2c: boolean | null,
  labels: { none: string; b2b: string; b2c: string },
): string {
  const b2b = isB2b === true
  const b2c = isB2c === true
  if (!b2b && !b2c) return labels.none
  const parts: string[] = []
  if (b2b) parts.push(labels.b2b)
  if (b2c) parts.push(labels.b2c)
  return parts.join(", ")
}

function formatBool(
  value: boolean | null | undefined,
  labels: { yes: string; no: string },
): string {
  if (value === true) return labels.yes
  if (value === false) return labels.no
  return "—"
}

function formatDateTime(value: string | null | undefined): string {
  if (!value?.trim()) return "—"
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

export type ProjectsTableFeedback = {
  variant: "default" | "destructive"
  title: string
  description: string
}

type ProjectsTableProps = {
  initialFeedback?: ProjectsTableFeedback | null
  /** When set, list is scoped to this company (`GET /v1/projects?company_id=…`). */
  companyId?: number
  companyName?: string
}

export function ProjectsTable({
  initialFeedback = null,
  companyId,
  companyName,
}: ProjectsTableProps) {
  const { t } = useTranslation("translation", { keyPrefix: "modules.projects" })
  const navigate = useNavigate()
  const authUser = useAuthUser()

  const { canCreate, canUpdate, canDelete, canViewDetail } = useMemo(() => {
    const p = authUser?.permissions ?? []
    return {
      canCreate: projectCanCreate(p),
      canUpdate: projectCanUpdate(p),
      canDelete: projectCanDelete(p),
      canViewDetail: projectCanView(p),
    }
  }, [authUser])

  const showActionsColumn = canUpdate || canViewDetail || canDelete
  const showRowMenu = canViewDetail || canDelete

  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(15)
  const [deleteTarget, setDeleteTarget] = useState<ProjectItem | null>(null)
  const [deleteSubmitting, setDeleteSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<ProjectsTableFeedback | null>(
    initialFeedback,
  )
  const [detailRow, setDetailRow] = useState<ProjectItem | null>(null)

  const businessTypeLabels = useMemo(
    () => ({
      none: t("table.noBusinessType"),
      b2b: t("table.businessTypeB2b"),
      b2c: t("table.businessTypeB2c"),
    }),
    [t],
  )

  const boolLabels = useMemo(
    () => ({
      yes: t("table.yes"),
      no: t("table.no"),
    }),
    [t],
  )

  const projectsBasePath =
    companyId != null && companyId > 0
      ? `/companies/${companyId}/projects`
      : "/projects"

  const swrKey = useMemo(() => {
    const query: Record<string, number> = {
      page: pageIndex + 1,
      per_page: pageSize,
    }
    if (companyId != null && companyId > 0) {
      query.company_id = companyId
    }
    return [PROJECTS_ENDPOINT, query] as const
  }, [pageIndex, pageSize, companyId])

  const { data, error, isLoading, isValidating, mutate } =
    useSWR<ProjectsResponse>(swrKey)

  useEffect(() => {
    if (!data?.success) return
    const last = data.data.pagination.last_page
    setPageIndex((p) => (p + 1 > last ? Math.max(0, last - 1) : p))
  }, [data])

  const rows: ProjectItem[] = useMemo(() => {
    if (!data?.success) return []
    return data.data.items
  }, [data])

  const totalRows = data?.success ? data.data.pagination.total : 0

  const onPageSizeChange = useCallback((next: number) => {
    setPageSize(next)
    setPageIndex(0)
  }, [])

  const goToEdit = useCallback(
    (row: ProjectItem) => {
      navigate(`${projectsBasePath}/${row.id}/edit`, {
        state: { project: row, companyName },
      })
    },
    [navigate, projectsBasePath, companyName],
  )

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return
    setDeleteSubmitting(true)
    try {
      const json = await api.delete<ProjectDeleteResponse>(
        projectPath(deleteTarget.id),
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

  const columns = useMemo<DataTableColumn<ProjectItem>[]>(() => {
    const cols: DataTableColumn<ProjectItem>[] = [
      {
        id: "id",
        header: t("table.colId"),
        cellClassName: "font-mono text-[11px]",
        cell: (row) => String(row.id),
      },
      {
        id: "business_name",
        header: t("table.colBusinessName"),
        cell: (row) => (
          <DataTableCellPill>{row.business_name}</DataTableCellPill>
        ),
      },
      {
        id: "website_url",
        header: t("table.colWebsite"),
        cell: (row) => {
          const url = row.website_url?.trim()
          if (!url) {
            return <DataTableCellPill>{null}</DataTableCellPill>
          }
          return (
            <DataTableCellPill className="max-w-[min(100%,20rem)] p-0">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex max-w-full items-center gap-1.5 truncate px-2 py-0.5 text-[var(--text-h)] underline-offset-2 hover:underline"
              >
                <Globe
                  className="size-3 shrink-0 text-[var(--text-muted)]"
                  strokeWidth={2.25}
                  aria-hidden
                />
                <span className="truncate">{url}</span>
              </a>
            </DataTableCellPill>
          )
        },
      },
      {
        id: "business_type",
        header: t("table.colBusinessType"),
        cell: (row) => (
          <DataTableCellPill>
            {formatBusinessType(row.is_b2b, row.is_b2c, businessTypeLabels)}
          </DataTableCellPill>
        ),
      },
    ]

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
                <Pencil className="size-3.5" aria-hidden />
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
                    <MoreVertical className="size-3.5" aria-hidden />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[10rem]">
                  {canViewDetail ? (
                    <DropdownMenuItem onSelect={() => setDetailRow(row)}>
                      {t("table.moreView")}
                    </DropdownMenuItem>
                  ) : null}
                  {canDelete ? (
                    <DropdownMenuItem
                      variant="destructive"
                      onSelect={() => setDeleteTarget(row)}
                    >
                      {t("table.delete")}
                    </DropdownMenuItem>
                  ) : null}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </div>
        ),
      })
    }

    return cols
  }, [
    t,
    businessTypeLabels,
    showActionsColumn,
    showRowMenu,
    canUpdate,
    canDelete,
    canViewDetail,
    goToEdit,
  ])

  const toolbar = (
    <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[var(--text-muted)]">
      <span>
        {companyId != null && companyName
          ? t("table.toolbarHintCompany", { company: companyName })
          : companyId != null
            ? t("table.toolbarHintCompanyId", { id: companyId })
            : t("table.toolbarHint")}
      </span>
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
          primaryAction={
            canCreate
              ? {
                  label: t("table.createProject"),
                  icon: (
                    <Plus className="size-3.5" strokeWidth={2.25} aria-hidden />
                  ),
                  onClick: () =>
                    navigate(`${projectsBasePath}/new`, {
                      state: companyName ? { companyName } : undefined,
                    }),
                }
              : undefined
          }
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
                    name: deleteTarget.business_name,
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
                <FolderKanban className="size-5" strokeWidth={2} aria-hidden />
              </span>
              <div className="min-w-0 flex-1 space-y-0.5">
                <SheetTitle className="line-clamp-2 text-balance">
                  {detailRow?.business_name ?? "—"}
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
            <DetailField label={t("table.colCompanyId")}>
              {detailRow ? String(detailRow.company_id) : "—"}
            </DetailField>
            <DetailField label={t("table.colWebsite")}>
              {detailRow?.website_url?.trim() ? (
                <a
                  href={detailRow.website_url.trim()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-medium text-[var(--text-h)] underline-offset-2 hover:underline"
                >
                  <Globe className="size-3.5 shrink-0" aria-hidden />
                  {detailRow.website_url.trim()}
                </a>
              ) : (
                <span className="text-[var(--text-muted)]">—</span>
              )}
            </DetailField>
            <DetailField label={t("table.colBusinessType")}>
              {detailRow
                ? formatBusinessType(
                    detailRow.is_b2b,
                    detailRow.is_b2c,
                    businessTypeLabels,
                  )
                : "—"}
            </DetailField>
            <DetailField label={t("table.colIsB2b")}>
              {detailRow ? formatBool(detailRow.is_b2b, boolLabels) : "—"}
            </DetailField>
            <DetailField label={t("table.colIsB2c")}>
              {detailRow ? formatBool(detailRow.is_b2c, boolLabels) : "—"}
            </DetailField>
            <DetailField label={t("table.colIndustryNiche")}>
              {detailRow ? String(detailRow.industry_niche_id) : "—"}
            </DetailField>
            <DetailField label={t("table.colIndustryOther")}>
              {detailRow?.industry_other?.trim() ? (
                detailRow.industry_other
              ) : (
                <span className="text-[var(--text-muted)]">—</span>
              )}
            </DetailField>
            <DetailField label={t("table.colTargetLocations")}>
              {detailRow && detailRow.target_locations.length ? (
                <div className="flex flex-wrap gap-1.5">
                  {detailRow.target_locations.map((loc) => (
                    <span
                      key={loc}
                      className="inline-flex rounded-full border border-[var(--border)] bg-[color-mix(in_srgb,var(--social-bg)_92%,var(--bg-elevated))] px-2 py-0.5 text-[11px] font-medium text-[var(--text-h)] shadow-xs dark:border-white/12 dark:bg-white/[0.08] dark:text-white/90"
                    >
                      {loc}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-[var(--text-muted)]">—</span>
              )}
            </DetailField>
            <DetailField label={t("table.colBriefDescription")}>
              {detailRow?.brief_description?.trim() ? (
                detailRow.brief_description
              ) : (
                <span className="text-[var(--text-muted)]">—</span>
              )}
            </DetailField>
            <DetailField label={t("table.colMainCompetitors")}>
              {detailRow?.main_competitors?.trim() ? (
                detailRow.main_competitors
              ) : (
                <span className="text-[var(--text-muted)]">—</span>
              )}
            </DetailField>
            <DetailField label={t("table.colSeoGoals")}>
              {detailRow && detailRow.seo_goals.length ? (
                <div className="flex flex-wrap gap-1.5">
                  {detailRow.seo_goals.map((goal) => (
                    <span
                      key={goal.id}
                      className="inline-flex rounded-full border border-[var(--border)] bg-[color-mix(in_srgb,var(--social-bg)_92%,var(--bg-elevated))] px-2 py-0.5 text-[11px] font-medium text-[var(--text-h)] shadow-xs dark:border-white/12 dark:bg-white/[0.08] dark:text-white/90"
                    >
                      {goal.name}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-[var(--text-muted)]">—</span>
              )}
            </DetailField>
            <DetailField label={t("table.colSeoGoalOther")}>
              {detailRow?.seo_goal_other?.trim() ? (
                detailRow.seo_goal_other
              ) : (
                <span className="text-[var(--text-muted)]">—</span>
              )}
            </DetailField>
            <DetailField label={t("table.colGoogleAnalytics")}>
              {detailRow ? formatBool(detailRow.has_google_analytics, boolLabels) : "—"}
            </DetailField>
            <DetailField label={t("table.colGoogleSearchConsole")}>
              {detailRow
                ? formatBool(detailRow.has_google_search_console, boolLabels)
                : "—"}
            </DetailField>
            <DetailField label={t("table.colGoogleTagManager")}>
              {detailRow ? formatBool(detailRow.has_google_tag_manager, boolLabels) : "—"}
            </DetailField>
            <DetailField label={t("table.colGoogleAds")}>
              {detailRow ? formatBool(detailRow.has_google_ads, boolLabels) : "—"}
            </DetailField>
            <DetailField label={t("table.colWebsiteLoginDetails")}>
              {detailRow
                ? formatBool(detailRow.has_website_login_details, boolLabels)
                : "—"}
            </DetailField>
            <DetailField label={t("table.colCmsLoginUrl")}>
              {detailRow?.cms_login_page_url?.trim() ? (
                <a
                  href={detailRow.cms_login_page_url.trim()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all font-medium text-[var(--text-h)] underline-offset-2 hover:underline"
                >
                  {detailRow.cms_login_page_url.trim()}
                </a>
              ) : (
                <span className="text-[var(--text-muted)]">—</span>
              )}
            </DetailField>
            <DetailField label={t("table.colCmsUsername")}>
              {detailRow?.cms_username?.trim() ? (
                detailRow.cms_username
              ) : (
                <span className="text-[var(--text-muted)]">—</span>
              )}
            </DetailField>
            <DetailField label={t("table.colCmsPasswordSet")}>
              {detailRow ? formatBool(detailRow.cms_password_set, boolLabels) : "—"}
            </DetailField>
            <DetailField label={t("table.colCreatedAt")}>
              {detailRow ? formatDateTime(detailRow.created_at) : "—"}
            </DetailField>
            <DetailField label={t("table.colUpdatedAt")}>
              {detailRow ? formatDateTime(detailRow.updated_at) : "—"}
            </DetailField>
          </div>
        </SheetContent>
      </Sheet>
    </Fragment>
  )
}
