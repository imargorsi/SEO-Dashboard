"use client";

import { AnalyticsGscRankingsCard } from "@/components/analytics/analytics-gsc-rankings-card";
import type { TAnalyticsDimensionRowDto } from "@/types/analytics.types";

type TAnalyticsTopPagesCardProps = {
  rows: TAnalyticsDimensionRowDto[];
  isLoading?: boolean;
  limit?: number;
  className?: string;
  projectId?: string | null;
  from?: string;
  to?: string;
};

export function AnalyticsTopPagesCard(props: TAnalyticsTopPagesCardProps) {
  return (
    <AnalyticsGscRankingsCard
      {...props}
      i18nKey="topPages"
      titleId="analytics-top-pages-title"
      showViewAll
    />
  );
}
