import { isValidIsoDate } from "@/lib/frontend/seo-activities/date-range.utils";
import type {
  TSeoActivityBacklink,
  TSeoActivityBlog,
  TSeoActivityType,
  TSeoActivityTechnicalWork,
} from "@/types/seo-activity.types";

export type TSeoActivityQuickAddValues = {
  title: string;
  url: string;
  anchorText: string;
  details: string;
  occurredOn: string;
};

export function todayIsoDate(now = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function emptyQuickAddValues(now = new Date()): TSeoActivityQuickAddValues {
  return {
    title: "",
    url: "",
    anchorText: "",
    details: "",
    occurredOn: todayIsoDate(now),
  };
}

export function activityToQuickAddValues(
  type: TSeoActivityType,
  row: TSeoActivityBlog | TSeoActivityBacklink | TSeoActivityTechnicalWork,
): TSeoActivityQuickAddValues {
  const values = emptyQuickAddValues();
  values.url = row.url ?? "";
  values.occurredOn = row.occurredOn && isValidIsoDate(row.occurredOn) ? row.occurredOn : todayIsoDate();

  if (type === "blogs") {
    values.title = (row as TSeoActivityBlog).title ?? "";
    return values;
  }

  if (type === "backlinks") {
    values.anchorText = (row as TSeoActivityBacklink).anchorText ?? "";
    return values;
  }

  values.details = (row as TSeoActivityTechnicalWork).details ?? "";
  return values;
}
