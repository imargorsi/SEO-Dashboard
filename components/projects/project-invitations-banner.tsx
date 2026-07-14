"use client";

import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Spinner } from "@/components/ui/spinner";
import {
  useAcceptProjectInvitationMutation,
  useDeclineProjectInvitationMutation,
  useMyProjectInvitationsQuery,
} from "@/features/projects/project-invites.api";
import { useSelectedProject } from "@/context/selected-project-context";
import { ApiError } from "@/lib/frontend/api/errors";
import { notify } from "@/lib/frontend/feedback/notify";
import {
  elevatedCardMutedClass,
  elevatedCardSurfaceClass,
  elevatedCardTitleClass,
} from "@/lib/frontend/layout/dashboard-chrome";
import { cn } from "@/lib/utils";

export function ProjectInvitationsBanner() {
  const { t } = useTranslation("translation", { keyPrefix: "modules.projects.invitations" });
  const { preferSelectedProjectId } = useSelectedProject();
  const invitationsQuery = useMyProjectInvitationsQuery();
  const acceptMutation = useAcceptProjectInvitationMutation();
  const declineMutation = useDeclineProjectInvitationMutation();

  const invitations = invitationsQuery.data ?? [];
  if (invitationsQuery.isPending || invitations.length === 0) {
    return null;
  }

  async function onAccept(projectId: string) {
    preferSelectedProjectId(projectId);
    try {
      const result = await acceptMutation.mutateAsync(projectId);
      notify.success(result.message?.trim() || t("acceptSuccess"));
    } catch (error) {
      notify.error(ApiError.messageFrom(error, t("acceptError")));
    }
  }

  async function onDecline(projectId: string) {
    try {
      const result = await declineMutation.mutateAsync(projectId);
      notify.success(result.message?.trim() || t("declineSuccess"));
    } catch (error) {
      notify.error(ApiError.messageFrom(error, t("declineError")));
    }
  }

  const busyProjectId =
    acceptMutation.isPending
      ? acceptMutation.variables
      : declineMutation.isPending
        ? declineMutation.variables
        : null;

  return (
    <div className="space-y-3" aria-label={t("bannerAria")}>
      {invitations.map((invitation) => {
        const isBusy = busyProjectId === invitation.projectId;
        const inviterName = invitation.invitedBy?.name ?? t("unknownInviter");

        return (
          <div
            key={invitation.projectId}
            className={cn(
              elevatedCardSurfaceClass,
              "flex flex-col gap-4 rounded-2xl px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5",
            )}
          >
            <div className="flex min-w-0 items-start gap-3">
              <UserAvatar
                name={invitation.projectName}
                imageUrl={invitation.projectImageUrl}
                size="md"
                roundedClassName="rounded-xl"
              />
              <div className="min-w-0 space-y-1">
                <p className={cn("type-body-strong", elevatedCardTitleClass)}>
                  {t("title", { projectName: invitation.projectName })}
                </p>
                <p className={cn("type-caption", elevatedCardMutedClass)}>
                  {t("invitedBy", { name: inviterName })}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isBusy}
                onClick={() => void onDecline(invitation.projectId)}
              >
                {declineMutation.isPending && declineMutation.variables === invitation.projectId ? (
                  <Spinner className="size-3.5" />
                ) : null}
                {t("decline")}
              </Button>
              <Button
                type="button"
                variant="gradient"
                size="sm"
                disabled={isBusy}
                onClick={() => void onAccept(invitation.projectId)}
              >
                {acceptMutation.isPending && acceptMutation.variables === invitation.projectId ? (
                  <Spinner className="size-3.5" />
                ) : null}
                {t("accept")}
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
