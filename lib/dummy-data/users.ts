import type { AdminUserItem, PaginatedList } from "./types";

const now = () => new Date().toISOString();

let users: AdminUserItem[] = [
  {
    id: "674b20000000000000000001",
    name: "Super Admin",
    email: "admin@seo-dashboard.example",
    email_verified_at: "2026-01-01T00:00:00.000Z",
    roles: ["super_admin"],
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "674b20000000000000000002",
    name: "Jane Cooper",
    email: "jane@acme-seo.example",
    email_verified_at: "2026-01-12T09:30:00.000Z",
    roles: [],
    created_at: "2026-01-12T09:00:00.000Z",
    updated_at: "2026-03-01T14:22:00.000Z",
  },
  {
    id: "674b20000000000000000003",
    name: "Robert Fox",
    email: "robert@northwind.example",
    email_verified_at: "2026-02-03T11:30:00.000Z",
    roles: [],
    created_at: "2026-02-03T11:15:00.000Z",
    updated_at: "2026-02-28T08:40:00.000Z",
  },
  {
    id: "674b20000000000000000004",
    name: "Esther Howard",
    email: "esther@brightpath.example",
    email_verified_at: null,
    roles: [],
    created_at: "2026-03-18T16:45:00.000Z",
    updated_at: "2026-03-18T16:45:00.000Z",
  },
  {
    id: "674b20000000000000000005",
    name: "Cameron Williamson",
    email: "cameron@summit.example",
    email_verified_at: "2026-04-02T10:45:00.000Z",
    roles: [],
    created_at: "2026-04-02T10:30:00.000Z",
    updated_at: "2026-04-10T12:00:00.000Z",
  },
];

function buildPagination(
  total: number,
  page: number,
  perPage: number,
): PaginatedList<AdminUserItem>["pagination"] {
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

export function listDummyUsers(params: {
  page?: number;
  per_page?: number;
  search?: string | null;
  newest?: boolean;
}): PaginatedList<AdminUserItem> {
  const page = params.page ?? 1;
  const perPage = params.per_page ?? 15;
  const search = params.search?.trim().toLowerCase() ?? "";
  const newest = params.newest !== false;

  let filtered = [...users];
  if (search) {
    filtered = filtered.filter(
      (u) =>
        u.name.toLowerCase().includes(search) ||
        u.email.toLowerCase().includes(search),
    );
  }

  filtered.sort((left, right) => {
    const leftTime = new Date(left.created_at).getTime();
    const rightTime = new Date(right.created_at).getTime();
    return newest ? rightTime - leftTime : leftTime - rightTime;
  });

  const pagination = buildPagination(filtered.length, page, perPage);
  const start = (pagination.current_page - 1) * perPage;
  const items = filtered.slice(start, start + perPage);

  return {
    items,
    pagination,
    filters: {
      search: params.search ?? null,
      newest: params.newest ?? true,
    },
  };
}

export function getDummyUser(id: string): AdminUserItem | null {
  return users.find((u) => u.id === id) ?? null;
}

export function createDummyUser(payload: { name: string; email: string }): AdminUserItem {
  const item: AdminUserItem = {
    id: `674b${Date.now().toString(16).padStart(20, "0").slice(0, 20)}`,
    name: payload.name,
    email: payload.email,
    email_verified_at: null,
    roles: [],
    created_at: now(),
    updated_at: now(),
  };
  users = [item, ...users];
  return item;
}
