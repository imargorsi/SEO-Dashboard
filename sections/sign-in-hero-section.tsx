"use client";

import { useTranslation } from "react-i18next";
import type { IconType } from "react-icons";
import {
  IoAnalyticsOutline,
  IoCheckmarkCircleOutline,
  IoLockClosedOutline,
  IoPeopleOutline,
  IoPulseOutline,
  IoSpeedometerOutline,
  IoTimeOutline,
} from "react-icons/io5";

import { Heading } from "@/components/heading";
import { AppLogo } from "@/components/layout/app-logo";
import { Paragraph } from "@/components/paragraph";
import {
  authHeroAccentClass,
  authHeroCopyClass,
  authHeroIconWellClass,
  authHeroMutedClass,
  authHeroPanelClass,
} from "@/lib/frontend/layout/auth-chrome";
import { cn } from "@/lib/utils";

type THeroFeature = {
  titleKey: "heroFeature1Title" | "heroFeature2Title" | "heroFeature3Title";
  bodyKey: "heroFeature1Body" | "heroFeature2Body" | "heroFeature3Body";
  icon: IconType;
};

type TTrustItem = {
  labelKey: "trustSecure" | "trustUptime" | "trustMultiClient" | "trustInsights";
  icon: IconType;
};

const HERO_FEATURES: THeroFeature[] = [
  {
    titleKey: "heroFeature1Title",
    bodyKey: "heroFeature1Body",
    icon: IoSpeedometerOutline,
  },
  {
    titleKey: "heroFeature2Title",
    bodyKey: "heroFeature2Body",
    icon: IoTimeOutline,
  },
  {
    titleKey: "heroFeature3Title",
    bodyKey: "heroFeature3Body",
    icon: IoAnalyticsOutline,
  },
];

const TRUST_ITEMS: TTrustItem[] = [
  { labelKey: "trustSecure", icon: IoLockClosedOutline },
  { labelKey: "trustUptime", icon: IoCheckmarkCircleOutline },
  { labelKey: "trustMultiClient", icon: IoPeopleOutline },
  { labelKey: "trustInsights", icon: IoPulseOutline },
];

export function SignInHeroSection() {
  const { t } = useTranslation("translation", { keyPrefix: "auth.signIn" });
  const { t: tLayout } = useTranslation("translation", { keyPrefix: "layout" });

  return (
    <section
      className={cn(
        authHeroPanelClass,
        "hidden flex-col justify-center gap-12 px-8 py-12 lg:flex lg:h-full lg:px-14 lg:py-16",
      )}
      aria-labelledby="sign-in-hero-heading"
    >
      <div className={cn("relative z-10 mx-auto w-full max-w-xl", authHeroCopyClass)}>
        <AppLogo
          alt={tLayout("appName")}
          surface="onDark"
          className="mb-12 block h-auto w-64 max-w-full sm:w-72"
          width={288}
          height={49}
          priority
        />

        <div className="flex flex-col gap-5">
          <Heading id="sign-in-hero-heading" heroTitle className={cn(authHeroCopyClass, "leading-tight")}>
            {t("heroTitleStart")}{" "}
            <span className={authHeroAccentClass}>{t("heroTitleAccent")}</span>
          </Heading>
          <Paragraph medium className={cn("max-w-md leading-relaxed", authHeroMutedClass)}>
            {t("heroLead")}
          </Paragraph>
        </div>

        <ul className="mt-11 list-none space-y-5 p-0">
          {HERO_FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <li key={feature.titleKey} className="flex items-start gap-3.5">
                <span className={cn(authHeroIconWellClass, "shrink-0")} aria-hidden>
                  <Icon className="size-5" />
                </span>
                <div className="min-w-0 flex flex-col gap-1">
                  <p className={cn("type-body-strong leading-snug", authHeroCopyClass)}>
                    {t(feature.titleKey)}
                  </p>
                  <Paragraph moreSmaller className={cn("leading-relaxed", authHeroMutedClass)}>
                    {t(feature.bodyKey)}
                  </Paragraph>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <ul
        className={cn(
          "relative z-10 mx-auto grid w-full max-w-xl list-none grid-cols-2 gap-x-4 gap-y-3 p-0 xl:grid-cols-4",
        )}
      >
        {TRUST_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <li
              key={item.labelKey}
              className={cn(
                "flex items-center gap-2 rounded-xl border border-white/12 bg-white/6 px-3 py-2.5 backdrop-blur-md",
              )}
            >
              <Icon className={cn("size-3.5 shrink-0", authHeroMutedClass)} aria-hidden />
              <span className={cn("type-caption leading-snug", authHeroMutedClass)}>
                {t(item.labelKey)}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
