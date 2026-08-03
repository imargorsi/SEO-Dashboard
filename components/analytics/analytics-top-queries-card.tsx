"use client";

import { AnalyticsGscRankingsCard } from "@/components/analytics/analytics-gsc-rankings-card";
import type { TAnalyticsDimensionRowDto } from "@/types/analytics.types";

type TAnalyticsTopQueriesCardProps = {
  rows: TAnalyticsDimensionRowDto[];
  isLoading?: boolean;
  limit?: number;
  className?: string;
  projectId?: string | null;
  from?: string;
  to?: string;
};

export function AnalyticsTopQueriesCard(props: TAnalyticsTopQueriesCardProps) {
  return (
    <AnalyticsGscRankingsCard
      {...props}
      i18nKey="topQueries"
      titleId="analytics-top-queries-title"
      showViewAll
    />
  );
}
