"use client";

import type { TAppIconComponent } from "@/components/ui/app-icon";
import { Icons } from "@/lib/frontend/icons/app-icons";

import { useTranslation } from "react-i18next";

import { GoogleBrandMark } from "@/components/auth/google-brand-mark";
import { Heading } from "@/components/heading";
import { GoogleIntegrationLogo } from "@/components/integrations/google-integration-logo";
import { WordpressIntegrationLogo } from "@/components/integrations/wordpress-integration-logo";
import { AppLogo } from "@/components/layout/app-logo";
import { Paragraph } from "@/components/paragraph";
import {
  authHeroAccentClass,
  authHeroCopyClass,
  authHeroFeatureCardClass,
  authHeroIconWellClass,
  authHeroMutedClass,
  authHeroPanelClass,
  authHeroTrustChipClass,
} from "@/lib/frontend/layout/auth-chrome";
import { typeStackMdClass } from "@/lib/frontend/layout/dashboard-chrome";
import { cn } from "@/lib/utils";

type THeroFeatureKey = 1 | 2 | 3 | 4;

type THeroFeatureMark = "crawllex" | "wordpress" | "google-search" | "workspaces";

type THeroFeature = {
  titleKey: `heroFeature${THeroFeatureKey}Title`;
  bodyKey: `heroFeature${THeroFeatureKey}Body`;
  mark: THeroFeatureMark;
};

type TTrustItem = {
  labelKey: "trustSecure" | "trustUptime" | "trustRoles" | "trustGoogle";
  mark?: "google";
  icon?: TAppIconComponent;
};

const HERO_FEATURES: THeroFeature[] = [
  { titleKey: "heroFeature1Title", bodyKey: "heroFeature1Body", mark: "crawllex" },
  { titleKey: "heroFeature2Title", bodyKey: "heroFeature2Body", mark: "wordpress" },
  { titleKey: "heroFeature3Title", bodyKey: "heroFeature3Body", mark: "google-search" },
  { titleKey: "heroFeature4Title", bodyKey: "heroFeature4Body", mark: "workspaces" },
];

const TRUST_ITEMS: TTrustItem[] = [
  { labelKey: "trustSecure", icon: Icons.security },
  { labelKey: "trustUptime", icon: Icons.checkCircle },
  { labelKey: "trustRoles", icon: Icons.userGroup },
  { labelKey: "trustGoogle", mark: "google" },
];

function FeatureMark({ mark }: { mark: THeroFeatureMark }) {
  if (mark === "wordpress") {
    return <WordpressIntegrationLogo size={22} />;
  }

  if (mark === "google-search") {
    return (
      <span className="flex items-center -space-x-1 rtl:space-x-reverse">
        <GoogleIntegrationLogo service="gsc" size={18} />
        <GoogleIntegrationLogo service="ga4" size={18} />
      </span>
    );
  }

  if (mark === "workspaces") {
    return (
      <span className="relative inline-block size-6">
        <AppLogo variant="mark" width={15} height={15} className="absolute inset-s-0 top-0 size-3.5 opacity-80" />
        <AppLogo variant="mark" width={16} height={16} className="absolute inset-e-0 bottom-0 size-4" />
      </span>
    );
  }

  return <AppLogo variant="mark" width={22} height={22} className="size-5.5" />;
}

function FeatureCard({
  feature,
  title,
  body,
}: {
  feature: THeroFeature;
  title: string;
  body: string;
}) {
  return (
    <li className={authHeroFeatureCardClass}>
      <span className={cn(authHeroIconWellClass, "shrink-0")} aria-hidden>
        <FeatureMark mark={feature.mark} />
      </span>
      <div className="flex min-w-0 flex-col gap-0.5">
        <p className={cn("type-body-strong leading-snug", authHeroCopyClass)}>{title}</p>
        <Paragraph smaller className={cn("leading-snug", authHeroMutedClass)}>
          {body}
        </Paragraph>
      </div>
    </li>
  );
}

function TrustMark({ item }: { item: TTrustItem }) {
  if (item.mark === "google") {
    return <GoogleBrandMark size={14} />;
  }

  const Icon = item.icon;
  if (!Icon) return null;
  return <Icon className="size-3.5 shrink-0 text-brand" aria-hidden />;
}

function SignInHeroTrustStrip() {
  const { t } = useTranslation("translation", { keyPrefix: "auth.signIn" });

  return (
    <ul className="flex w-full max-w-xl list-none flex-wrap justify-start gap-1.5 p-0 sm:flex-nowrap">
      {TRUST_ITEMS.map((item) => (
        <li key={item.labelKey} className={authHeroTrustChipClass}>
          <TrustMark item={item} />
          <span className={cn("whitespace-nowrap type-caption leading-snug", authHeroCopyClass)}>
            {t(item.labelKey)}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function SignInHeroSection() {
  const { t } = useTranslation("translation", { keyPrefix: "auth.signIn" });
  const { t: tLayout } = useTranslation("translation", { keyPrefix: "layout" });

  return (
    <section
      className={cn(authHeroPanelClass, "hidden lg:flex")}
      aria-labelledby="sign-in-hero-heading"
    >
      <div
        className={cn(
          "flex min-h-full w-full flex-col justify-center px-8 py-12 pb-24 lg:px-14 lg:py-12 lg:pb-24",
          authHeroCopyClass,
        )}
      >
        <div className="mx-auto w-full max-w-xl">
          <AppLogo
            alt={tLayout("appName")}
            surface="onDark"
            className="mb-8 block h-auto w-72 max-w-full"
            width={288}
            height={96}
            priority
          />

          <div className={typeStackMdClass}>
            <Heading id="sign-in-hero-heading" heroTitle className={cn(authHeroCopyClass, "leading-tight")}>
              {t("heroTitleStart")}{" "}
              <span className={authHeroAccentClass}>{t("heroTitleAccent")}</span>
            </Heading>
            <Paragraph className={cn("max-w-lg leading-relaxed", authHeroMutedClass)}>
              {t("heroLead")}
            </Paragraph>
          </div>

          <ul className="mt-10 grid list-none grid-cols-1 gap-5 p-0">
            {HERO_FEATURES.map((feature) => (
              <FeatureCard
                key={feature.titleKey}
                feature={feature}
                title={t(feature.titleKey)}
                body={t(feature.bodyKey)}
              />
            ))}
          </ul>
        </div>
      </div>

      <div className="absolute inset-s-8 inset-e-8 bottom-8 z-10 lg:inset-s-14 lg:inset-e-14 lg:bottom-10">
        <div className="mx-auto w-full max-w-xl">
          <SignInHeroTrustStrip />
        </div>
      </div>
    </section>
  );
}
