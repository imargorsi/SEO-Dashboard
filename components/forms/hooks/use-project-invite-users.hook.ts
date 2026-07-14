"use client";

import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import type { TInviteUserOption } from "@/components/forms/project-invite-user-select";
import {
  inviteProjectMemberRequest,
  useInviteProjectMemberMutation,
  useRevokeProjectInviteMutation,
} from "@/features/projects/project-invites.api";
import { ApiError } from "@/lib/frontend/api/errors";
import { notify } from "@/lib/frontend/feedback/notify";
import type { TProjectInvitee } from "@/types/project.types";

type UseProjectInviteUsersOptions = {
  projectId?: string | null;
  isEdit: boolean;
  initialInvitees?: TProjectInvitee[];
  canInvite: boolean;
};

type TSavedInviteUser = TInviteUserOption & { membershipStatus: "invited" | "active" };

const EMPTY_INVITEES: TProjectInvitee[] = [];

function mapInviteeToOption(invitee: TProjectInvitee): TSavedInviteUser {
  return {
    id: invitee.userId,
    name: invitee.name,
    email: invitee.email,
    profileImage: invitee.profileImage,
    membershipStatus: invitee.status,
  };
}

function inviteesSnapshot(invitees: TProjectInvitee[]): string {
  return invitees.map((invitee) => `${invitee.userId}:${invitee.status}`).join("\0");
}

export function useProjectInviteUsers({
  projectId,
  isEdit,
  initialInvitees = EMPTY_INVITEES,
  canInvite,
}: UseProjectInviteUsersOptions) {
  const { t } = useTranslation("translation", { keyPrefix: "modules.projects.createForm" });
  const [pendingUsers, setPendingUsers] = useState<TInviteUserOption[]>([]);
  const [savedUsers, setSavedUsers] = useState<TSavedInviteUser[]>(() =>
    initialInvitees.map(mapInviteeToOption),
  );
  const [prevInviteesSnapshot, setPrevInviteesSnapshot] = useState(() =>
    inviteesSnapshot(initialInvitees),
  );

  const nextInviteesSnapshot = inviteesSnapshot(initialInvitees);
  if (isEdit && nextInviteesSnapshot !== prevInviteesSnapshot) {
    setPrevInviteesSnapshot(nextInviteesSnapshot);
    setSavedUsers(initialInvitees.map(mapInviteeToOption));
  }

  const inviteMutation = useInviteProjectMemberMutation(projectId ?? "");
  const revokeMutation = useRevokeProjectInviteMutation(projectId ?? "");

  const selectedUsers = isEdit && projectId ? savedUsers : pendingUsers;
  const excludedUserIds = useMemo(() => selectedUsers.map((user) => user.id), [selectedUsers]);
  const isMutating = inviteMutation.isPending || revokeMutation.isPending;

  const addUser = useCallback(
    async (user: TInviteUserOption) => {
      if (!canInvite) {
        notify.error(t("inviteForbidden"));
        return;
      }
      if (selectedUsers.some((item) => item.id === user.id)) return;

      if (isEdit && projectId) {
        try {
          const result = await inviteMutation.mutateAsync(user.id);
          setSavedUsers((prev) => [
            ...prev,
            {
              id: result.invite.userId,
              name: result.invite.name,
              email: result.invite.email,
              profileImage: result.invite.profileImage,
              membershipStatus: "invited",
            },
          ]);
          notify.success(result.message?.trim() || t("inviteSuccess"));
        } catch (error) {
          notify.error(ApiError.messageFrom(error, t("inviteError")));
        }
        return;
      }

      setPendingUsers((prev) => [...prev, user]);
    },
    [canInvite, inviteMutation, isEdit, projectId, selectedUsers, t],
  );

  const removeUser = useCallback(
    async (userId: string) => {
      if (isEdit && projectId) {
        try {
          const result = await revokeMutation.mutateAsync(userId);
          setSavedUsers((prev) => prev.filter((user) => user.id !== userId));
          notify.success(result.message?.trim() || t("inviteRemoved"));
        } catch (error) {
          notify.error(ApiError.messageFrom(error, t("inviteRemoveError")));
        }
        return;
      }

      setPendingUsers((prev) => prev.filter((user) => user.id !== userId));
    },
    [isEdit, projectId, revokeMutation, t],
  );

  /** After create: send invites for locally collected users. */
  async function flushPendingInvites(
    createdProjectId: string,
  ): Promise<{ failed: number; total: number }> {
    const total = pendingUsers.length;
    if (total === 0) return { failed: 0, total: 0 };

    const results = await Promise.allSettled(
      pendingUsers.map((user) => inviteProjectMemberRequest(createdProjectId, user.id)),
    );

    const failed = results.filter((result) => result.status === "rejected").length;
    return { failed, total };
  }

  return {
    selectedUsers,
    excludedUserIds,
    isMutating,
    isLoadingInvites: false,
    canInvite,
    addUser,
    removeUser,
    flushPendingInvites,
    pendingInviteCount: pendingUsers.length,
  };
}

export type TUseProjectInviteUsersResult = ReturnType<typeof useProjectInviteUsers>;
