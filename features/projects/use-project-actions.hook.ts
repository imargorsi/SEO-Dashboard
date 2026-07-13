"use client";

import { useTranslation } from "react-i18next";

import { useProjectStatusActionMutation } from "@/features/projects/projects.api";
import { ApiError } from "@/lib/frontend/api/errors";
import { notify } from "@/lib/frontend/feedback/notify";
import type { TProjectStatusAction } from "@/lib/projects/project-card-actions.utils";

type TProjectStatusSuccessKey = "approve" | "decline" | "active" | "inactive";

function getSuccessMessageKey(action: TProjectStatusAction): TProjectStatusSuccessKey {
  if (action === "approve") return "approve";
  if (action === "reject") return "decline";
  if (action === "activate") return "active";
  return "inactive";
}

export function useProjectActions(projectId: string) {
  const { t } = useTranslation("translation", { keyPrefix: "modules.projects.cardActions" });
  const statusMutation = useProjectStatusActionMutation();
  const isPending = statusMutation.isPending && statusMutation.variables?.projectId === projectId;

  async function handleStatusAction(action: TProjectStatusAction) {
    try {
      const result = await statusMutation.mutateAsync({ projectId, action });
      const fallback = t(`success.${getSuccessMessageKey(action)}`);
      notify.success(result.message?.trim() || fallback);
    } catch (error) {
      notify.error(ApiError.messageFrom(error, t("errorFallback")));
    }
  }

  return {
    isPending,
    handleStatusAction,
  };
}
