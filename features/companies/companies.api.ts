"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AdminCompanyItem, CreateCompanyPayload, PaginatedList } from "@/lib/dummy-data";
import {
  approveDummyCompany,
  createDummyCompany,
  deleteDummyCompany,
  getDummyCompany,
  listDummyCompanies,
  updateDummyCompany,
} from "@/lib/dummy-data/companies";

const companiesApi = {
  reducerPath: "companies-api" as const,
};

const companiesKeys = {
  all: [companiesApi.reducerPath] as const,
  list: (params: { page: number; per_page: number }) =>
    [...companiesKeys.all, "list", params] as const,
  detail: (id: string) => [...companiesKeys.all, "detail", id] as const,
};

export type CompaniesListParams = {
  page?: number;
  per_page?: number;
  search?: string | null;
};

async function fetchCompanies(params: CompaniesListParams): Promise<PaginatedList<AdminCompanyItem>> {
  await new Promise((r) => setTimeout(r, 200));
  return listDummyCompanies({
    page: params.page ?? 1,
    per_page: params.per_page ?? 15,
    search: params.search,
  });
}

async function fetchCompany(id: string): Promise<AdminCompanyItem> {
  await new Promise((r) => setTimeout(r, 150));
  const company = getDummyCompany(id);
  if (!company) throw new Error("Company not found");
  return company;
}

export function useCompaniesQuery(params: CompaniesListParams) {
  const page = params.page ?? 1;
  const perPage = params.per_page ?? 15;

  return useQuery({
    queryKey: companiesKeys.list({ page, per_page: perPage }),
    queryFn: () => fetchCompanies({ page, per_page: perPage, search: params.search }),
  });
}

export function useCompanyQuery(id: string | undefined) {
  return useQuery({
    queryKey: companiesKeys.detail(id ?? ""),
    queryFn: () => fetchCompany(id!),
    enabled: Boolean(id),
  });
}

export function useCreateCompanyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateCompanyPayload) => {
      await new Promise((r) => setTimeout(r, 300));
      return createDummyCompany(payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: companiesKeys.all });
    },
  });
}

export function useUpdateCompanyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: CreateCompanyPayload }) => {
      await new Promise((r) => setTimeout(r, 300));
      const updated = updateDummyCompany(id, payload);
      if (!updated) throw new Error("Company not found");
      return updated;
    },
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: companiesKeys.all });
      void queryClient.invalidateQueries({ queryKey: companiesKeys.detail(id) });
    },
  });
}

export function useDeleteCompanyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await new Promise((r) => setTimeout(r, 300));
      const ok = deleteDummyCompany(id);
      if (!ok) throw new Error("Company not found");
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: companiesKeys.all });
    },
  });
}

export function useApproveCompanyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await new Promise((r) => setTimeout(r, 300));
      const approved = approveDummyCompany(id);
      if (!approved) throw new Error("Company not found");
      return approved;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: companiesKeys.all });
    },
  });
}
