"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { baseQuery } from "@/lib/frontend/api/base";
import { projectKeys } from "@/features/projects/projects.api";
import type {
  TMyProjectInvitation,
  TProjectInviteMember,
} from "@/types/project-invite.types";

const inviteKeys = {
  all: ["project-invites"] as const,
  project: (projectId: string) => [...inviteKeys.all, "project", projectId] as const,
  mine: () => [...inviteKeys.all, "mine"] as const,
};

export async function inviteProjectMemberRequest(
  projectId: string,
  userId: string,
): Promise<{ invite: TProjectInviteMember; message: string | null }> {
  const envelope = await baseQuery.post<TProjectInviteMember>(`projects/${projectId}/invites`, {
    userId,
  });
  return { invite: envelope.data, message: envelope.message };
}

export function useInviteProjectMemberMutation(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => inviteProjectMemberRequest(projectId, userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: inviteKeys.project(projectId) });
      void queryClient.invalidateQueries({ queryKey: inviteKeys.mine() });
      void queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
    },
  });
}

export function useRevokeProjectInviteMutation(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const envelope = await baseQuery.delete<null>(`projects/${projectId}/invites/${userId}`);
      return { message: envelope.message };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: inviteKeys.project(projectId) });
      void queryClient.invalidateQueries({ queryKey: inviteKeys.mine() });
      void queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
    },
  });
}

async function fetchMyProjectInvitations(): Promise<TMyProjectInvitation[]> {
  const envelope = await baseQuery.get<{ items: TMyProjectInvitation[] }>("me/project-invitations");
  return envelope.data.items ?? [];
}

export function useMyProjectInvitationsQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: inviteKeys.mine(),
    queryFn: fetchMyProjectInvitations,
    enabled: options?.enabled ?? true,
  });
}

export function useAcceptProjectInvitationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectId: string) => {
      const envelope = await baseQuery.post<null>(`me/project-invitations/${projectId}/accept`);
      return { projectId, message: envelope.message };
    },
    onSuccess: (_data, projectId) => {
      void queryClient.invalidateQueries({ queryKey: inviteKeys.mine() });
      void queryClient.invalidateQueries({ queryKey: projectKeys.all });
      void queryClient.invalidateQueries({ queryKey: projectKeys.access(projectId) });
    },
  });
}

export function useDeclineProjectInvitationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectId: string) => {
      const envelope = await baseQuery.post<null>(`me/project-invitations/${projectId}/decline`);
      return { projectId, message: envelope.message };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: inviteKeys.mine() });
    },
  });
}
