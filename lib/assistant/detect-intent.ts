import { parseAssistantQuery } from "@/lib/assistant/nlp/parse-query";
import type { TAssistantIntent, TAssistantParse } from "@/types/assistant.types";

export function detectAssistantIntent(query: string): TAssistantIntent {
  return parseAssistantQuery(query).kind;
}

export function permissionForAssistantIntent(
  intent: TAssistantIntent,
): "leads.view" | "analytics.view" | "seo_activities.view" | null {
  switch (intent) {
    case "leads_count":
      return "leads.view";
    case "analytics_overview":
    case "analytics_metric":
    case "analytics_top":
      return "analytics.view";
    case "seo_count":
      return "seo_activities.view";
    default:
      return null;
  }
}

export function permissionForAssistantParse(
  parsed: TAssistantParse,
): "leads.view" | "analytics.view" | "seo_activities.view" | null {
  return permissionForAssistantIntent(parsed.kind);
}
