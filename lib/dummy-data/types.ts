export type CompanyRegistrationStatus = "pending" | "approved";

export type AdminCompanyItem = {
  id: string;
  name: string;
  slug: string;
  poc_name: string | null;
  poc_email: string | null;
  users_count: number;
  created_at: string;
  updated_at: string;
  is_active?: boolean;
  status?: CompanyRegistrationStatus | string;
};

export type AdminUserItem = {
  id: string;
  name: string;
  email: string;
  email_verified_at: string | null;
  company_id: string | null;
  company_name: string | null;
  roles: string[];
  created_at: string;
  updated_at: string;
};

export type ListPagination = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
  has_more_pages: boolean;
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
};

export type ListFilters = {
  search: string | null;
  sort: string;
  direction: string;
  page: number;
  per_page: number;
};

export type PaginatedList<T> = {
  items: T[];
  pagination: ListPagination;
  filters: ListFilters;
};

export type CreateCompanyPayload = {
  company_name: string;
  poc_name: string;
  poc_email: string;
  is_active: boolean;
};
