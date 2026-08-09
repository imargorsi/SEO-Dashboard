"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAccessToken } from "@/hooks/use-access-token.hook";
import { baseQuery } from "@/lib/frontend/api/base";
import { LEAD_DEFAULT_PER_PAGE, LEAD_MAX_PER_PAGE } from "@/lib/leads/constants";
import type {
  TLeadColumnMapping,
  TLeadDto,
  TLeadsImportPreview,
  TLeadsImportResult,
  TPaginatedLeads,
} from "@/types/lead.types";

const leadsApi = {
  reducerPath: "leads-api" as const,
};

export const leadsKeys = {
  all: [leadsApi.reducerPath] as const,
  list: (projectId: string, params: TLeadsListParams) =>
    [...leadsKeys.all, "list", projectId, params] as const,
};

export type TLeadsListParams = {
  page?: number;
  per_page?: number;
  from?: string | null;
  to?: string | null;
  q?: string | null;
};

export type TLeadWritePayload = {
  firstName: string;
  lastName?: string;
  email: string;
  phone: string;
  servicesInterestedIn?: string;
  message: string;
  leadDate: string;
};

async function fetchLeads(projectId: string, params: TLeadsListParams): Promise<TPaginatedLeads> {
  const searchParams = new URLSearchParams();
  searchParams.set("page", String(params.page ?? 1));
  searchParams.set("per_page", String(params.per_page ?? LEAD_DEFAULT_PER_PAGE));
  if (params.from) searchParams.set("from", params.from);
  if (params.to) searchParams.set("to", params.to);
  if (params.q) searchParams.set("q", params.q);

  const envelope = await baseQuery.get<TPaginatedLeads>(
    `projects/${projectId}/leads?${searchParams.toString()}`,
  );
  return envelope.data;
}

export function useLeadsQuery(
  projectId: string | null | undefined,
  params: TLeadsListParams,
  options?: { enabled?: boolean },
) {
  const token = useAccessToken();
  const page = params.page ?? 1;
  const perPage = params.per_page ?? LEAD_DEFAULT_PER_PAGE;
  const from = params.from ?? null;
  const to = params.to ?? null;
  const q = params.q ?? null;
  const listParams = { page, per_page: perPage, from, to, q };

  return useQuery({
    queryKey: leadsKeys.list(projectId ?? "", listParams),
    queryFn: () => fetchLeads(projectId!, listParams),
    enabled: Boolean(projectId) && (options?.enabled ?? true) && Boolean(token),
  });
}

function invalidateLeadLists(queryClient: ReturnType<typeof useQueryClient>, projectId?: string | null) {
  if (!projectId) return;
  void queryClient.invalidateQueries({ queryKey: [...leadsKeys.all, "list", projectId] });
}

export function useCreateLeadMutation(projectId: string | null | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: TLeadWritePayload) => {
      const envelope = await baseQuery.post<TLeadDto>(`projects/${projectId}/leads`, payload);
      return envelope.data;
    },
    onSuccess: () => invalidateLeadLists(queryClient, projectId),
  });
}

export function useUpdateLeadMutation(projectId: string | null | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ leadId, payload }: { leadId: string; payload: TLeadWritePayload }) => {
      const envelope = await baseQuery.patch<TLeadDto>(
        `projects/${projectId}/leads/${leadId}`,
        payload,
      );
      return envelope.data;
    },
    onSuccess: () => invalidateLeadLists(queryClient, projectId),
  });
}

export function useDeleteLeadMutation(projectId: string | null | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (leadId: string) => {
      await baseQuery.delete(`projects/${projectId}/leads/${leadId}`);
    },
    onSuccess: () => invalidateLeadLists(queryClient, projectId),
  });
}

export async function previewLeadsImport(
  projectId: string,
  file: File,
): Promise<TLeadsImportPreview> {
  const formData = new FormData();
  formData.append("file", file);
  const envelope = await baseQuery.post<TLeadsImportPreview>(
    `projects/${projectId}/leads/import/preview`,
    formData,
  );
  return envelope.data;
}

export async function commitLeadsImport(
  projectId: string,
  file: File,
  mapping: TLeadColumnMapping,
): Promise<TLeadsImportResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("mapping", JSON.stringify(mapping));
  const envelope = await baseQuery.post<TLeadsImportResult>(
    `projects/${projectId}/leads/import`,
    formData,
  );
  return envelope.data;
}

/** Paginate through the list API so export includes every matching lead (max page size). */
export async function fetchLeadsForExport(
  projectId: string,
  params: Omit<TLeadsListParams, "page" | "per_page">,
): Promise<TLeadDto[]> {
  const perPage = LEAD_MAX_PER_PAGE;
  const items: TLeadDto[] = [];
  let page = 1;
  let lastPage = 1;

  do {
    const result = await fetchLeads(projectId, {
      ...params,
      page,
      per_page: perPage,
    });
    items.push(...result.items);
    lastPage = Math.max(1, result.pagination.last_page);
    page += 1;
  } while (page <= lastPage);

  return items;
}
