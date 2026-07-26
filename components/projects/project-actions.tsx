"use client";

import Link from "next/link";
import type { IconType } from "react-icons";
import {
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoEyeOutline,
  IoPersonAddOutline,
  IoTrashOutline,
} from "react-icons/io5";
import { PiPencilThin } from "react-icons/pi";
import { useTranslation } from "react-i18next";

import { ActiveInactiveToggle } from "@/components/ui/active-inactive-toggle";
import { buttonVariants } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useProjectActions } from "@/features/projects/use-project-actions.hook";
import { ACTION_BUTTON_TONE, ACTION_ICON_WELL } from "@/lib/frontend/projects/project-action-styles.utils";
import { elevatedCardTitleClass } from "@/lib/frontend/layout/dashboard-chrome";
import type { ProjectStatus } from "@/lib/projects/constants";
import {
  buildProjectCardActions,
  type TProjectCardActionConfig,
  type TProjectCardActionId,
  type TProjectStatusAction,
} from "@/lib/projects/project-card-actions.utils";
import { cn } from "@/lib/utils";

export type TProjectActionSize = "small" | "big";

const ACTION_ICONS: Record<Exclude<TProjectCardActionId, "activate" | "deactivate">, IconType> = {
  approve: IoCheckmarkCircleOutline,
  reject: IoCloseCircleOutline,
  inviteUsers: IoPersonAddOutline,
  viewDetails: IoEyeOutline,
  edit: PiPencilThin,
  delete: IoTrashOutline,
};

type ProjectActionButtonProps = {
  action: TProjectCardActionConfig;
  label: string;
  isLoading: boolean;
  size: TProjectActionSize;
  onStatusAction?: (action: TProjectStatusAction) => void;
  onInviteUsers?: () => void;
  onDeleteProject?: () => void;
};

export function ProjectActionButton({
  action,
  label,
  isLoading,
  size,
  onStatusAction,
  onInviteUsers,
  onDeleteProject,
}: ProjectActionButtonProps) {
  if (action.id === "activate" || action.id === "deactivate") {
    return null;
  }

  const Icon = ACTION_ICONS[action.id];
  const isActionLoading = Boolean(action.action) && isLoading;
  const isDisabled = isActionLoading;
  const isBig = size === "big";

  const surfaceClass = cn(
    "group relative transition-all duration-200",
    isBig
      ? cn(buttonVariants({ variant: "outline", size: "md" }), "rounded-full", ACTION_BUTTON_TONE[action.tone])
      : "flex min-w-0 flex-1 flex-col items-center gap-2",
    isDisabled && "pointer-events-none opacity-70",
  );

  const content = isBig ? (
    <>
      {isActionLoading ? <Spinner className="size-4" /> : <Icon className="size-4 shrink-0" aria-hidden />}
      <span>{label}</span>
    </>
  ) : (
    <>
      <span
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-full border transition-transform duration-200 group-hover:scale-105",
          ACTION_ICON_WELL[action.tone],
        )}
        aria-hidden
      >
        {isActionLoading ? <Spinner className="size-5" /> : <Icon className="size-5" />}
      </span>
      <span
        className={cn(
          "type-caption-xs text-center font-semibold leading-tight transition-colors group-hover:text-text-primary",
          elevatedCardTitleClass,
        )}
      >
        {label}
      </span>
    </>
  );

  if (action.href && !isDisabled) {
    return (
      <Link href={action.href} className={surfaceClass}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={surfaceClass}
      disabled={isDisabled}
      onClick={() => {
        if (action.id === "inviteUsers") {
          onInviteUsers?.();
          return;
        }
        if (action.id === "delete") {
          onDeleteProject?.();
          return;
        }
        if (action.action && onStatusAction) {
          onStatusAction(action.action);
        }
      }}
    >
      {content}
    </button>
  );
}

type ProjectActionsProps = {
  projectId: string;
  status: ProjectStatus;
  isSuperAdmin: boolean;
  canViewDetails?: boolean;
  canEditProject?: boolean;
  canInviteMembers?: boolean;
  canDeleteProject?: boolean;
  onInviteUsers?: () => void;
  onDeleteProject?: () => void;
  size?: TProjectActionSize;
  withCardFooter?: boolean;
  /** When false, activate/deactivate is handled elsewhere (e.g. beside project owner). */
  includeActiveInactiveToggle?: boolean;
  className?: string;
};

function isActiveInactiveAction(action: TProjectCardActionConfig): boolean {
  return action.id === "activate" || action.id === "deactivate";
}

export function ProjectActions({
  projectId,
  status,
  isSuperAdmin,
  canViewDetails = false,
  canEditProject = false,
  canInviteMembers = false,
  canDeleteProject = false,
  onInviteUsers,
  onDeleteProject,
  size = "small",
  withCardFooter = false,
  includeActiveInactiveToggle = false,
  className,
}: ProjectActionsProps) {
  const { t } = useTranslation("translation", { keyPrefix: "modules.projects.cardActions" });
  const { isPending, handleStatusAction } = useProjectActions(projectId);

  const actions = buildProjectCardActions({
    status,
    projectId,
    isSuperAdmin,
    canViewDetails,
    canEditProject,
    canInviteMembers,
    canDeleteProject,
  });

  if (actions.length === 0) return null;

  const statusActions = actions.filter((action) => action.group === "status");
  const generalActions = actions.filter((action) => action.group === "general");
  const toggleAction = includeActiveInactiveToggle
    ? statusActions.find(isActiveInactiveAction)
    : undefined;
  const buttonStatusActions = statusActions.filter((action) => !isActiveInactiveAction(action));
  const isBig = size === "big";
  const isActive = status === "active";
  const showDivider = isBig && buttonStatusActions.length > 0 && generalActions.length > 0;

  function renderAction(action: TProjectCardActionConfig) {
    return (
      <ProjectActionButton
        key={action.id}
        action={action}
        label={t(action.labelKey)}
        isLoading={isPending}
        size={size}
        onStatusAction={handleStatusAction}
        onInviteUsers={onInviteUsers}
        onDeleteProject={onDeleteProject}
      />
    );
  }

  function renderActiveInactiveToggle() {
    if (!toggleAction) return null;

    return (
      <ActiveInactiveToggle
        key="active-inactive-toggle"
        checked={isActive}
        isLoading={isPending}
        ariaLabel={isActive ? t("inactive") : t("active")}
        onCheckedChange={(nextChecked) =>
          void handleStatusAction(nextChecked ? "activate" : "deactivate")
        }
      />
    );
  }

  const visibleActionsCount =
    generalActions.length + buttonStatusActions.length + (toggleAction ? 1 : 0);

  if (visibleActionsCount === 0) return null;

  const actionsContent = isBig ? (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {buttonStatusActions.map(renderAction)}
      {showDivider ? <div className="h-9 w-px shrink-0 bg-border" aria-hidden /> : null}
      {generalActions.map(renderAction)}
      {renderActiveInactiveToggle()}
    </div>
  ) : (
    <div
      className={cn(
        "grid gap-2.5",
        visibleActionsCount === 1 && "grid-cols-1",
        visibleActionsCount === 2 && "grid-cols-2",
        visibleActionsCount === 3 && "grid-cols-3",
        visibleActionsCount >= 4 && "grid-cols-2 sm:grid-cols-4",
        className,
      )}
    >
      {buttonStatusActions.map(renderAction)}
      {generalActions.map(renderAction)}
      {renderActiveInactiveToggle()}
    </div>
  );

  if (withCardFooter) {
    return <div className="mt-6 border-t border-border pt-5">{actionsContent}</div>;
  }

  return actionsContent;
}
