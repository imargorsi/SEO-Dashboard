"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import type { TInviteUserOption } from "@/components/forms/project-invite-user-select";
import {
  useInviteProjectMemberMutation,
  useRevokeProjectInviteMutation,
} from "@/features/projects/project-invites.api";
import { ApiError } from "@/lib/frontend/api/errors";
import { notify } from "@/lib/frontend/feedback/notify";
import type { TProjectInvitee } from "@/types/project.types";

type UseProjectInviteUsersOptions = {
  projectId: string;
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

/**
 * Invite UI for an existing project: seed from `invitedUsers`, stage new picks locally,
 * send invitations on Save. Removing an already-saved invitee revokes immediately.
 */
export function useProjectInviteUsers({
  projectId,
  initialInvitees = EMPTY_INVITEES,
  canInvite,
}: UseProjectInviteUsersOptions) {
  const { t } = useTranslation("translation", { keyPrefix: "modules.projects.inviteModal" });
  const [savedUsers, setSavedUsers] = useState<TSavedInviteUser[]>(() =>
    initialInvitees.map(mapInviteeToOption),
  );
  const [pendingUsers, setPendingUsers] = useState<TInviteUserOption[]>([]);
  const [inviteesKey, setInviteesKey] = useState(() => inviteesSnapshot(initialInvitees));

  useEffect(() => {
    const nextKey = inviteesSnapshot(initialInvitees);
    if (nextKey === inviteesKey) return;
    setInviteesKey(nextKey);
    setSavedUsers(initialInvitees.map(mapInviteeToOption));
    setPendingUsers((prev) => {
      const savedIds = new Set(initialInvitees.map((invitee) => invitee.userId));
      return prev.filter((user) => !savedIds.has(user.id));
    });
  }, [initialInvitees, inviteesKey]);

  const inviteMutation = useInviteProjectMemberMutation(projectId);
  const revokeMutation = useRevokeProjectInviteMutation(projectId);

  const selectedUsers = useMemo(
    () => [...savedUsers, ...pendingUsers],
    [pendingUsers, savedUsers],
  );
  const excludedUserIds = useMemo(() => selectedUsers.map((user) => user.id), [selectedUsers]);
  const isMutating = inviteMutation.isPending || revokeMutation.isPending;
  const hasPending = pendingUsers.length > 0;

  const addUser = useCallback(
    (user: TInviteUserOption) => {
      if (!canInvite) {
        notify.error(t("forbidden"));
        return;
      }
      if (selectedUsers.some((item) => item.id === user.id)) return;
      setPendingUsers((prev) => [...prev, user]);
    },
    [canInvite, selectedUsers, t],
  );

  const removeUser = useCallback(
    async (userId: string) => {
      const isPending = pendingUsers.some((user) => user.id === userId);
      if (isPending) {
        setPendingUsers((prev) => prev.filter((user) => user.id !== userId));
        return;
      }

      if (!canInvite) {
        notify.error(t("forbidden"));
        return;
      }

      try {
        const result = await revokeMutation.mutateAsync(userId);
        setSavedUsers((prev) => prev.filter((user) => user.id !== userId));
        notify.success(result.message?.trim() || t("inviteRemoved"));
      } catch (error) {
        notify.error(ApiError.messageFrom(error, t("inviteRemoveError")));
      }
    },
    [canInvite, pendingUsers, revokeMutation, t],
  );

  const savePendingInvites = useCallback(async () => {
    if (!canInvite) {
      notify.error(t("forbidden"));
      return { failed: 0, total: 0 };
    }
    if (pendingUsers.length === 0) {
      return { failed: 0, total: 0 };
    }

    const batch = [...pendingUsers];
    let failed = 0;
    const invited: TSavedInviteUser[] = [];
    const remaining: TInviteUserOption[] = [];

    for (const user of batch) {
      try {
        const result = await inviteMutation.mutateAsync(user.id);
        invited.push({
          id: result.invite.userId,
          name: result.invite.name,
          email: result.invite.email,
          profileImage: result.invite.profileImage,
          membershipStatus: "invited",
        });
      } catch {
        failed += 1;
        remaining.push(user);
      }
    }

    const total = batch.length;
    setPendingUsers(remaining);
    if (invited.length > 0) {
      setSavedUsers((prev) => {
        const existing = new Set(prev.map((user) => user.id));
        return [...prev, ...invited.filter((user) => !existing.has(user.id))];
      });
    }

    if (total > 0 && failed === 0) {
      notify.success(t("inviteBatchSuccess"));
    } else if (failed > 0 && failed < total) {
      notify.error(t("inviteBatchPartialError", { count: failed }));
    } else if (failed === total) {
      notify.error(t("inviteError"));
    }

    return { failed, total };
  }, [canInvite, inviteMutation, pendingUsers, t]);

  return {
    selectedUsers,
    excludedUserIds,
    isMutating,
    canInvite,
    hasPending,
    addUser,
    removeUser,
    savePendingInvites,
  };
}

export type TUseProjectInviteUsersResult = ReturnType<typeof useProjectInviteUsers>;
