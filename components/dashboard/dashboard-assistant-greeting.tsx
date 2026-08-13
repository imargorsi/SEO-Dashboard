"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { Heading } from "@/components/heading";
import { Paragraph } from "@/components/paragraph";
import type { TAppIconComponent } from "@/components/ui/app-icon";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion.hook";
import { Icons } from "@/lib/frontend/icons/app-icons";
import { typeStackMdClass } from "@/lib/frontend/layout/dashboard-chrome";
import { cn } from "@/lib/utils";

const ASSISTANT_AI_ICONS: TAppIconComponent[] = [Icons.bot, Icons.sparkles, Icons.rocket];
const ICON_CYCLE_MS = 1800;

type TDashboardAssistantGreetingProps = {
  greeting: string;
  compact?: boolean;
};

export function DashboardAssistantGreeting({
  greeting,
  compact = false,
}: TDashboardAssistantGreetingProps) {
  const { t } = useTranslation("translation", { keyPrefix: "home.assistant" });
  const reduceMotion = usePrefersReducedMotion();
  const [iconIndex, setIconIndex] = useState(0);
  const iconSizeClass = compact ? "size-5" : "size-6";

  useEffect(() => {
    if (reduceMotion) return;
    const timer = window.setInterval(() => {
      setIconIndex((current) => (current + 1) % ASSISTANT_AI_ICONS.length);
    }, ICON_CYCLE_MS);
    return () => window.clearInterval(timer);
  }, [reduceMotion]);

  return (
    <div className={cn("flex shrink-0 items-start", compact ? "gap-2.5" : "gap-3")}>
      <span
        className={cn(
          "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand text-text-on-brand",
          compact ? "size-10" : "size-12",
          !reduceMotion && "assistant-ai-well",
        )}
        aria-hidden
      >
        {reduceMotion ? (
          <Icons.bot className={iconSizeClass} />
        ) : (
          ASSISTANT_AI_ICONS.map((Icon, index) => (
            <Icon
              key={index}
              className={cn(
                "absolute inset-0 m-auto transition-opacity duration-500",
                iconSizeClass,
                index === iconIndex ? "opacity-100" : "opacity-0",
              )}
            />
          ))
        )}
      </span>
      <div className={cn(typeStackMdClass, "min-w-0")}>
        <Heading id="dashboard-assistant-title" SmallTitle className="leading-tight">
          {greeting}
        </Heading>
        <Paragraph moreSmaller className="leading-snug text-text-secondary">
          {compact ? t("descriptionShort") : t("description")}
        </Paragraph>
      </div>
    </div>
  );
}
