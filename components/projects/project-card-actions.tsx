"use client";

import Link from "next/link";
import type { IconType } from "react-icons";
import {
  IoCheckmark,
  IoClose,
  IoCreateOutline,
  IoEyeOutline,
  IoPauseCircleOutline,
  IoPlayCircleOutline,
  IoTimeOutline,
} from "react-icons/io5";
import { useTranslation } from "react-i18next";

import { useProjectStatusActionMutation } from "@/features/projects/projects.api";
import type { TProjectListItem } from "@/features/projects/projects.api";
import { ApiError } from "@/lib/frontend/api/errors";
import { notify } from "@/lib/frontend/feedback/notify";
import {
  buildProjectCardActions,
  type TProjectCardActionConfig,
  type TProjectCardActionId,
  type TProjectCardActionTone,
  type TProjectStatusAction,
} from "@/lib/projects/project-card-actions.utils";
import { cn } from "@/lib/utils";

type ProjectCardActionsProps = {
  project: TProjectListItem;
  isSuperAdmin: boolean;
  canViewDetails: boolean;
  canEditProject: boolean;
};

const TONE_ICON_CLASS: Record<TProjectCardActionTone, string> = {
  success: "text-success",
  warning: "text-warning",
  destructive: "text-destructive",
  muted: "text-text-muted",
  brand: "text-brand",
  default: "text-text-primary",
};

const ACTION_ICONS: Record<TProjectCardActionId, IconType> = {
  approve: IoCheckmark,
  reject: IoClose,
  activate: IoPlayCircleOutline,
  deactivate: IoPauseCircleOutline,
  activeState: IoPlayCircleOutline,
  inactiveState: IoPauseCircleOutline,
  pendingState: IoTimeOutline,
  viewDetails: IoEyeOutline,
  edit: IoCreateOutline,
};

type TProjectStatusSuccessKey = "approve" | "decline" | "active" | "inactive";

function getSuccessMessageKey(action: TProjectStatusAction): TProjectStatusSuccessKey {
  if (action === "approve") return "approve";
  if (action === "reject") return "decline";
  if (action === "activate") return "active";
  return "inactive";
}

type TProjectCardActionButtonProps = {
  action: TProjectCardActionConfig;
  label: string;
  isLoading: boolean;
  onStatusAction?: (action: TProjectStatusAction) => void;
};

function ProjectCardActionButton({
  action,
  label,
  isLoading,
  onStatusAction,
}: TProjectCardActionButtonProps) {
  const Icon = ACTION_ICONS[action.id];
  const toneClass = TONE_ICON_CLASS[action.tone];
  const isDisabled = Boolean(action.disabled) || (Boolean(action.action) && isLoading);

  const content = (
    <>
      <Icon className={cn("size-5 shrink-0", toneClass)} aria-hidden />
      <span className="type-caption-xs text-text-muted">{label}</span>
    </>
  );

  const className = cn(
    "flex min-w-[4.5rem] flex-1 flex-col items-center justify-center gap-1.5 rounded-xl border px-2 py-2.5 transition-colors",
    action.isCurrentState
      ? "border-success/40 bg-success/10"
      : "border-border bg-bg-input hover:bg-bg-hover",
    isDisabled && "cursor-not-allowed opacity-60 hover:bg-bg-input",
  );

  if (action.href && !isDisabled) {
    return (
      <Link href={action.href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={className}
      disabled={isDisabled}
      onClick={() => {
        if (action.action && onStatusAction) {
          onStatusAction(action.action);
        }
      }}
    >
      {content}
    </button>
  );
}

export function ProjectCardActions({
  project,
  isSuperAdmin,
  canViewDetails,
  canEditProject,
}: ProjectCardActionsProps) {
  const { t } = useTranslation("translation", { keyPrefix: "modules.projects.cardActions" });
  const statusMutation = useProjectStatusActionMutation();
  const actions = buildProjectCardActions({
    status: project.status,
    projectId: project.id,
    isSuperAdmin,
    canViewDetails,
    canEditProject,
  });

  if (actions.length === 0) return null;

  const statusActions = actions.filter((action) => action.group === "status");
  const generalActions = actions.filter((action) => action.group === "general");

  async function handleStatusAction(action: TProjectStatusAction) {
    try {
      const result = await statusMutation.mutateAsync({ projectId: project.id, action });
      const fallback = t(`success.${getSuccessMessageKey(action)}`);
      notify.success(result.message?.trim() || fallback);
    } catch (error) {
      notify.error(ApiError.messageFrom(error, t("errorFallback")));
    }
  }

  const isProjectMutationPending =
    statusMutation.isPending && statusMutation.variables?.projectId === project.id;

  return (
    <div className="mt-6 flex items-stretch gap-3 border-t border-border pt-5">
      {statusActions.length > 0 ? (
        <div className="flex flex-1 items-stretch gap-2">
          {statusActions.map((action) => (
            <ProjectCardActionButton
              key={action.id}
              action={action}
              label={t(action.labelKey)}
              isLoading={isProjectMutationPending}
              onStatusAction={(nextAction) => void handleStatusAction(nextAction)}
            />
          ))}
        </div>
      ) : null}

      {statusActions.length > 0 && generalActions.length > 0 ? (
        <div className="w-px self-stretch bg-border" aria-hidden />
      ) : null}

      {generalActions.length > 0 ? (
        <div className="flex flex-1 items-stretch gap-2">
          {generalActions.map((action) => (
            <ProjectCardActionButton
              key={action.id}
              action={action}
              label={t(action.labelKey)}
              isLoading={false}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
