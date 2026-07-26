export const SEO_ACTIVITY_TYPES = ["blogs", "backlinks", "web_changes"] as const;

export type TSeoActivityType = (typeof SEO_ACTIVITY_TYPES)[number];

export type TSeoActivityDto = {
  id: string;
  activityType: TSeoActivityType;
  url: string;
  occurredOn: string;
  title: string | null;
  anchorText: string | null;
  details: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TSeoActivityBlog = {
  id: string;
  title: string | null;
  url: string | null;
  occurredOn: string | null;
};

export type TSeoActivityBacklink = {
  id: string;
  url: string | null;
  anchorText: string | null;
  occurredOn: string | null;
};

export type TSeoActivityWebChange = {
  id: string;
  url: string | null;
  details: string | null;
  occurredOn: string | null;
};

export type TSeoActivityRow = TSeoActivityBlog | TSeoActivityBacklink | TSeoActivityWebChange;

export type TSeoActivityTypeCounts = Record<TSeoActivityType, number>;

export type TSeoActivitiesListFilters = {
  type: TSeoActivityType;
  from: string | null;
  to: string | null;
  type_counts: TSeoActivityTypeCounts;
};

export type TPaginatedSeoActivities = {
  items: TSeoActivityDto[];
  pagination: {
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
  filters: TSeoActivitiesListFilters;
};

export function toSeoActivityTableRow(
  item: TSeoActivityDto,
): TSeoActivityBlog | TSeoActivityBacklink | TSeoActivityWebChange {
  if (item.activityType === "blogs") {
    return {
      id: item.id,
      title: item.title,
      url: item.url,
      occurredOn: item.occurredOn,
    };
  }

  if (item.activityType === "backlinks") {
    return {
      id: item.id,
      url: item.url,
      anchorText: item.anchorText,
      occurredOn: item.occurredOn,
    };
  }

  return {
    id: item.id,
    url: item.url,
    details: item.details,
    occurredOn: item.occurredOn,
  };
}
