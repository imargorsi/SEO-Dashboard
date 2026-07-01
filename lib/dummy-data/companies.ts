import type { AdminCompanyItem, CreateCompanyPayload, PaginatedList } from "./types";

const now = () => new Date().toISOString();

let companies: AdminCompanyItem[] = [
  {
    id: "674a10000000000000000001",
    name: "Acme SEO Ltd",
    slug: "acme-seo-ltd",
    poc_name: "Jane Cooper",
    poc_email: "jane@acme-seo.example",
    users_count: 4,
    created_at: "2026-01-12T09:00:00.000Z",
    updated_at: "2026-03-01T14:22:00.000Z",
    is_active: true,
    status: "approved",
  },
  {
    id: "674a10000000000000000002",
    name: "Northwind Digital",
    slug: "northwind-digital",
    poc_name: "Robert Fox",
    poc_email: "robert@northwind.example",
    users_count: 2,
    created_at: "2026-02-03T11:15:00.000Z",
    updated_at: "2026-02-28T08:40:00.000Z",
    is_active: true,
    status: "approved",
  },
  {
    id: "674a10000000000000000003",
    name: "BrightPath Marketing",
    slug: "brightpath-marketing",
    poc_name: "Esther Howard",
    poc_email: "esther@brightpath.example",
    users_count: 1,
    created_at: "2026-03-18T16:45:00.000Z",
    updated_at: "2026-03-18T16:45:00.000Z",
    is_active: false,
    status: "pending",
  },
  {
    id: "674a10000000000000000004",
    name: "Summit Analytics Co",
    slug: "summit-analytics-co",
    poc_name: "Cameron Williamson",
    poc_email: "cameron@summit.example",
    users_count: 3,
    created_at: "2026-04-02T10:30:00.000Z",
    updated_at: "2026-04-10T12:00:00.000Z",
    is_active: true,
    status: "approved",
  },
  {
    id: "674a10000000000000000005",
    name: "Lighthouse Media",
    slug: "lighthouse-media",
    poc_name: "Brooklyn Simmons",
    poc_email: "brooklyn@lighthouse.example",
    users_count: 1,
    created_at: "2026-05-20T13:20:00.000Z",
    updated_at: "2026-05-20T13:20:00.000Z",
    is_active: true,
    status: "pending",
  },
];

function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildPagination(
  total: number,
  page: number,
  perPage: number,
): PaginatedList<AdminCompanyItem>["pagination"] {
  const lastPage = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(Math.max(1, page), lastPage);
  const from = total === 0 ? null : (safePage - 1) * perPage + 1;
  const to = total === 0 ? null : Math.min(safePage * perPage, total);

  return {
    current_page: safePage,
    last_page: lastPage,
    per_page: perPage,
    total,
    from,
    to,
    has_more_pages: safePage < lastPage,
    links: {
      first: safePage > 1 ? "?page=1" : null,
      last: safePage < lastPage ? `?page=${lastPage}` : null,
      prev: safePage > 1 ? `?page=${safePage - 1}` : null,
      next: safePage < lastPage ? `?page=${safePage + 1}` : null,
    },
  };
}

export function listDummyCompanies(params: {
  page?: number;
  per_page?: number;
  search?: string | null;
}): PaginatedList<AdminCompanyItem> {
  const page = params.page ?? 1;
  const perPage = params.per_page ?? 15;
  const search = params.search?.trim().toLowerCase() ?? "";

  let filtered = [...companies];
  if (search) {
    filtered = filtered.filter(
      (c) =>
        c.name.toLowerCase().includes(search) ||
        c.poc_name?.toLowerCase().includes(search) ||
        c.poc_email?.toLowerCase().includes(search),
    );
  }

  const pagination = buildPagination(filtered.length, page, perPage);
  const start = (pagination.current_page - 1) * perPage;
  const items = filtered.slice(start, start + perPage);

  return {
    items,
    pagination,
    filters: {
      search: params.search ?? null,
      sort: "created_at",
      direction: "desc",
      page: pagination.current_page,
      per_page: perPage,
    },
  };
}

export function getDummyCompany(id: string): AdminCompanyItem | null {
  return companies.find((c) => c.id === id) ?? null;
}

export function createDummyCompany(payload: CreateCompanyPayload): AdminCompanyItem {
  const item: AdminCompanyItem = {
    id: `674a${Date.now().toString(16).padStart(20, "0").slice(0, 20)}`,
    name: payload.company_name,
    slug: slugify(payload.company_name),
    poc_name: payload.poc_name,
    poc_email: payload.poc_email,
    users_count: 1,
    created_at: now(),
    updated_at: now(),
    is_active: payload.is_active,
    status: "approved",
  };
  companies = [item, ...companies];
  return item;
}

export function updateDummyCompany(id: string, payload: CreateCompanyPayload): AdminCompanyItem | null {
  const index = companies.findIndex((c) => c.id === id);
  if (index < 0) return null;

  const updated: AdminCompanyItem = {
    ...companies[index],
    name: payload.company_name,
    slug: slugify(payload.company_name),
    poc_name: payload.poc_name,
    poc_email: payload.poc_email,
    is_active: payload.is_active,
    updated_at: now(),
  };
  companies[index] = updated;
  return updated;
}

export function deleteDummyCompany(id: string): boolean {
  const before = companies.length;
  companies = companies.filter((c) => c.id !== id);
  return companies.length < before;
}

export function approveDummyCompany(id: string): AdminCompanyItem | null {
  const index = companies.findIndex((c) => c.id === id);
  if (index < 0) return null;

  const updated: AdminCompanyItem = {
    ...companies[index],
    status: "approved",
    updated_at: now(),
  };
  companies[index] = updated;
  return updated;
}
