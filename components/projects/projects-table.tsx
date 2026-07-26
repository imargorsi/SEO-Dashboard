"use client";

import { useCallback } from "react";
import { useTranslation } from "react-i18next";

import { AppTable } from "@/components/table/app-table";
import {
  useProjectsTableColumns,
  type TProjectTableAccess,
  type TProjectTableRow,
} from "@/hooks/use-projects-table-columns.hook";
import { useProjectStatusActionMutation, type TProjectListItem } from "@/features/projects/projects.api";
import { ApiError } from "@/lib/frontend/api/errors";
import { notify } from "@/lib/frontend/feedback/notify";
import type { TProjectStatusAction } from "@/lib/projects/project-card-actions.utils";

type TProjectsTableProps = {
  projects: TProjectListItem[];
  isLoading: boolean;
  isFetching?: boolean;
  isSuperAdmin: boolean;
  getAccess: (project: TProjectListItem) => TProjectTableAccess;
};

function getSuccessMessageKey(action: TProjectStatusAction): "approve" | "decline" | "active" | "inactive" {
  if (action === "approve") return "approve";
  if (action === "reject") return "decline";
  if (action === "activate") return "active";
  return "inactive";
}

export function ProjectsTable({
  projects,
  isLoading,
  isFetching = false,
  isSuperAdmin,
  getAccess,
}: TProjectsTableProps) {
  const { t } = useTranslation("translation", { keyPrefix: "modules.projects" });
  const { t: tActions } = useTranslation("translation", { keyPrefix: "modules.projects.cardActions" });
  const statusMutation = useProjectStatusActionMutation();

  const onStatusAction = useCallback(
    async (project: TProjectListItem, action: TProjectStatusAction) => {
      try {
        const result = await statusMutation.mutateAsync({ projectId: project.id, action });
        const fallback = tActions(`success.${getSuccessMessageKey(action)}`);
        notify.success(result.message?.trim() || fallback);
      } catch (error) {
        notify.error(ApiError.messageFrom(error, tActions("errorFallback")));
      }
    },
    [statusMutation, tActions],
  );

  const columns = useProjectsTableColumns({
    isSuperAdmin,
    getAccess,
    onStatusAction: (project, action) => {
      void onStatusAction(project, action);
    },
    statusActionPendingProjectId: statusMutation.isPending ? (statusMutation.variables?.projectId ?? null) : null,
  });

  return (
    <AppTable
      columns={columns}
      data={projects as TProjectTableRow[]}
      getRowId={(item) => item.id}
      isLoading={isLoading}
      isFetching={isFetching}
      emptyTitle={t("statusFilter.emptyTitle")}
      emptyBody={t("statusFilter.emptyBody")}
    />
  );
}
