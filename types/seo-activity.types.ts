export const SEO_ACTIVITY_TYPES = ["blogs", "backlinks", "web_changes"] as const;

export type TSeoActivityType = (typeof SEO_ACTIVITY_TYPES)[number];

export type TSeoActivityBlog = {
  id: string;
  projectName: string | null;
  title: string | null;
  url: string | null;
  occurredOn: string | null;
};

export type TSeoActivityBacklink = {
  id: string;
  projectName: string | null;
  url: string | null;
  anchorText: string | null;
  occurredOn: string | null;
};

export type TSeoActivityWebChange = {
  id: string;
  projectName: string | null;
  url: string | null;
  details: string | null;
  occurredOn: string | null;
};

export type TSeoActivityRow = TSeoActivityBlog | TSeoActivityBacklink | TSeoActivityWebChange;

export type TSeoActivityTypeCounts = Record<TSeoActivityType, number>;
