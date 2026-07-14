export type TAdminUserProjectAssignment = {
  id: string;
  name: string;
  /** Project workflow status. */
  status: "pending" | "active" | "inactive" | "rejected";
  membership_role: "project_owner" | "project_user" | string;
  membership_status: "active" | "invited" | "removed";
};

export type TAdminUserListItem = {
  id: string;
  name: string;
  email: string;
  profile_image: string | null;
  status: "active" | "inactive";
  email_verified_at: string | null;
  projects: TAdminUserProjectAssignment[];
  created_at: string;
  updated_at: string;
};

export type TAdminUserDetail = {
  id: string;
  name: string;
  email: string;
  profile_image: string | null;
  status: "active" | "inactive";
  email_verified_at: string | null;
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
  status?: "active" | "inactive" | null;
  status_counts?: {
    all: number;
    active: number;
    inactive: number;
  };
};

export type TPaginatedList<T> = {
  items: T[];
  pagination: TListPagination;
  filters: TListFilters;
};
