"use client";

import Image from "next/image";
import { useTranslation } from "react-i18next";
import { Heading } from "@/components/heading";
import { Paragraph } from "@/components/paragraph";
import { IoCheckmarkCircleOutline } from "react-icons/io5";

export function SignInHeroSection() {
  const { t } = useTranslation("translation", { keyPrefix: "auth.signIn" });
  const { t: tLayout } = useTranslation("translation", { keyPrefix: "layout" });

  return (
    <section
      className="relative hidden flex-1 flex-col justify-center overflow-hidden px-8 py-12 lg:flex lg:px-14 lg:py-16"
      aria-labelledby="sign-in-hero-heading"
    >
      <div className="relative z-10 mx-auto w-full max-w-xl text-text-primary">
        <Image
          src="/logo.svg"
          alt={tLayout("appName")}
          className="mb-10 block h-auto w-48 max-w-full"
          width={176}
          height={32}
          priority
        />

        <div className="space-y-4">
          <Heading id="sign-in-hero-heading" className="type-display text-text-primary">
            {t("heroTitleStart")} <span className="text-gradient-primary">{t("heroTitleAccent")}</span>
          </Heading>
          <Paragraph className="max-w-md text-sm font-normal leading-relaxed text-text-secondary sm:text-[0.9375rem]">
            {t("heroLead")}
          </Paragraph>
        </div>

        <ul className="mt-9 list-none space-y-4 p-0">
          <li className="flex gap-3">
            <IoCheckmarkCircleOutline className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
            <Paragraph className="text-sm font-normal leading-relaxed text-text-secondary sm:text-[0.9375rem]">
              {t("heroPoint1")}
            </Paragraph>
          </li>
          <li className="flex gap-3">
            <IoCheckmarkCircleOutline className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
            <Paragraph className="text-sm font-normal leading-relaxed text-text-secondary sm:text-[0.9375rem]">
              {t("heroPoint2")}
            </Paragraph>
          </li>
          <li className="flex gap-3">
            <IoCheckmarkCircleOutline className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
            <Paragraph className="text-sm font-normal leading-relaxed text-text-secondary sm:text-[0.9375rem]">
              {t("heroPoint3")}
            </Paragraph>
          </li>
        </ul>
      </div>
    </section>
  );
}
