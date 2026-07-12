"use client";

import { useTranslation } from "react-i18next";
import Image from "next/image";
import { AppLogo } from "@/components/layout/app-logo";
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
      <Image
        src="/auth-bg.png"
        alt=""
        fill
        priority
        className="object-cover object-center"
        aria-hidden
      />
      <div className="relative z-10 mx-auto w-full max-w-xl text-text-primary">
        <AppLogo
          alt={tLayout("appName")}
          className="mb-12 block h-auto w-56 max-w-full"
          width={176}
          height={32}
          priority
        />

        <div className="space-y-4">
          <Heading id="sign-in-hero-heading" heroTitle>
            {t("heroTitleStart")}{" "}
            <span className="text-gradient-primary">{t("heroTitleAccent")}</span>
          </Heading>
          <Paragraph medium className="max-w-md leading-relaxed">
            {t("heroLead")}
          </Paragraph>
        </div>

        <ul className="mt-9 list-none space-y-4 p-0">
          <li className="flex gap-3">
            <IoCheckmarkCircleOutline className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden />
            <Paragraph className="leading-relaxed">
              {t("heroPoint1")}
            </Paragraph>
          </li>
          <li className="flex gap-3">
            <IoCheckmarkCircleOutline className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden />
            <Paragraph className="leading-relaxed">
              {t("heroPoint2")}
            </Paragraph>
          </li>
          <li className="flex gap-3">
            <IoCheckmarkCircleOutline className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden />
            <Paragraph className="leading-relaxed">
              {t("heroPoint3")}
            </Paragraph>
          </li>
        </ul>
      </div>
    </section>
  );
}
