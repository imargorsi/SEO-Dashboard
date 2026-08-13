"use client";

import { Icons } from "@/lib/frontend/icons/app-icons";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";

import { ProjectInviteUserSelect } from "@/components/forms/project-invite-user-select";
import { useProjectInviteUsers } from "@/components/forms/hooks/use-project-invite-users.hook";
import { Button } from "@/components/ui/button";
import { DialogSectionDivider } from "@/components/ui/dialog-section-divider";
import { Spinner } from "@/components/ui/spinner";
import { useProjectQuery } from "@/features/projects/projects.api";
import { dialogSurfaceClass } from "@/lib/frontend/layout/dashboard-chrome";
import { overlayClass } from "@/lib/frontend/theme/chrome-tones";
import { cn } from "@/lib/utils";

type TProjectInviteUsersQuickAddProps = {
  open: boolean;
  projectId: string | null;
  canInvite: boolean;
  onOpenChange: (open: boolean) => void;
};

function ProjectInviteUsersQuickAddBody({
  projectId,
  canInvite,
  onOpenChange,
}: {
  projectId: string;
  canInvite: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation("translation", { keyPrefix: "modules.projects.inviteModal" });
  const titleId = useId();
  const descriptionId = useId();
  const { data: project, isPending, isError } = useProjectQuery(projectId);
  const inviteUsers = useProjectInviteUsers({
    projectId,
    initialInvitees: project?.invitedUsers ?? [],
    canInvite,
  });

  async function onSave() {
    const { failed, total } = await inviteUsers.savePendingInvites();
    if (total > 0 && failed === 0) {
      onOpenChange(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      className={cn(
        "relative z-10 flex max-h-[min(92vh,40rem)] w-full max-w-lg flex-col overflow-hidden rounded-3xl",
        dialogSurfaceClass,
      )}
    >
      <header className="relative shrink-0 px-6 pb-5 pt-6">
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="absolute inset-e-4 top-4 rounded-lg p-2 text-text-muted transition-colors hover:bg-bg-hover hover:text-text-primary"
        >
          <Icons.cancel className="size-4" aria-hidden />
          <span className="sr-only">{t("close")}</span>
        </button>

        <div className="flex flex-col gap-1.5 pe-10">
          <h2 id={titleId} className="type-title text-text-primary">
            {t("title")}
          </h2>
          <p id={descriptionId} className="type-caption text-text-muted">
            {project?.businessName ? t("leadWithProject", { name: project.businessName }) : t("lead")}
          </p>
        </div>
      </header>
      <DialogSectionDivider />

      <div className="min-h-0 overflow-y-auto overscroll-contain px-6 py-6">
        {!canInvite ? (
          <p className="type-body text-text-muted">{t("forbidden")}</p>
        ) : isPending ? (
          <div className="flex items-center gap-2 type-body text-text-muted">
            <Spinner className="size-4" />
            <span>{t("loading")}</span>
          </div>
        ) : isError ? (
          <p className="type-body text-status-rejected">{t("loadError")}</p>
        ) : (
          <ProjectInviteUserSelect
            selectedUsers={inviteUsers.selectedUsers}
            excludedUserIds={[
              ...inviteUsers.excludedUserIds,
              ...(project.owner?.id ? [project.owner.id] : []),
            ]}
            onSelect={inviteUsers.addUser}
            onRemove={(userId) => void inviteUsers.removeUser(userId)}
            isMutating={inviteUsers.isMutating}
            disabled={!canInvite || inviteUsers.isMutating}
            helpText={t("help")}
          />
        )}
      </div>

      <DialogSectionDivider />
      <footer className="flex shrink-0 flex-col-reverse gap-3 px-6 py-5 sm:flex-row sm:items-center sm:justify-end">
        <Button
          type="button"
          variant="outlined"
          size="md"
          onClick={() => onOpenChange(false)}
          className="w-full sm:w-auto"
        >
          {t("done")}
        </Button>
        <Button
          type="button"
          variant="outlined"
          size="md"
          disabled={!canInvite || !inviteUsers.hasPending || inviteUsers.isMutating || isPending || isError}
          onClick={() => void onSave()}
          className="w-full sm:min-w-36 sm:w-auto"
        >
          <span className="inline-flex items-center justify-center gap-2">
            {inviteUsers.isMutating ? <Spinner className="size-4 shrink-0" /> : null}
            {inviteUsers.isMutating ? t("saving") : t("save")}
          </span>
        </Button>
      </footer>
    </div>
  );
}

export function ProjectInviteUsersQuickAdd({
  open,
  projectId,
  canInvite,
  onOpenChange,
}: TProjectInviteUsersQuickAddProps) {
  const { t } = useTranslation("translation", { keyPrefix: "modules.projects.inviteModal" });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onOpenChange(false);
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onOpenChange]);

  if (!mounted || !open || !projectId) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center sm:p-6">
      <button
        type="button"
        aria-label={t("close")}
        className={cn("absolute inset-0 backdrop-blur-[2px]", overlayClass)}
        onClick={() => onOpenChange(false)}
      />
      <ProjectInviteUsersQuickAddBody
        key={projectId}
        projectId={projectId}
        canInvite={canInvite}
        onOpenChange={onOpenChange}
      />
    </div>,
    document.body,
  );
}
