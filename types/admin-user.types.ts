export type TAdminUserListItem = {
  id: string;
  name: string;
  email: string;
  email_verified_at: string | null;
  roles: string[];
  created_at: string;
  updated_at: string;
};

export type TListPagination = {
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

export type TListFilters = {
  search: string | null;
  newest: boolean;
};

export type TPaginatedList<T> = {
  items: T[];
  pagination: TListPagination;
  filters: TListFilters;
};
