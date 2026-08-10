export type TAssistantIntent =
  | "leads_this_month"
  | "leads_last_month"
  | "leads_this_year"
  | "analytics_overview"
  | "analytics_top_queries"
  | "analytics_top_pages"
  | "unknown";

export type TAssistantAction = {
  label: string;
  route: string;
};

export type TAssistantHistoryItem = {
  id: string;
  query: string;
  intent: string;
  createdAt: string;
};

export type TAssistantQueryResult = {
  message: string;
  intent: TAssistantIntent;
  action?: TAssistantAction;
  history: TAssistantHistoryItem[];
};

export type TAssistantHistoryDto = {
  items: TAssistantHistoryItem[];
};
