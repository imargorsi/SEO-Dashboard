"use client";

import Image from "next/image";
import { useTranslation } from "react-i18next";
import { Heading } from "@/components/heading";
import { Paragraph } from "@/components/paragraph";

export function SignInHeroSection() {
  const { t } = useTranslation("translation", { keyPrefix: "auth.signIn" });
  const { t: tLayout } = useTranslation("translation", { keyPrefix: "layout" });

  return (
    <section
      className="relative flex flex-1 flex-col justify-center overflow-hidden border-[var(--border)] px-6 py-12 sm:px-10 lg:border-e lg:px-14 lg:py-16"
      aria-labelledby="sign-in-hero-heading"
    >
      <Image src="/images/auth-hero-placeholder.svg" alt="" fill priority className="object-cover" aria-hidden />
      <div className="pointer-events-none absolute inset-0 bg-black/55" aria-hidden />

      <div className="relative z-10 mx-auto w-full max-w-md text-white [&_h2]:!text-white [&_p]:!text-white/90">
        <img
          src="/Logo.svg"
          alt={tLayout("appName")}
          className="mb-10 block h-auto w-44 max-w-full"
          width={176}
          height={30}
          draggable={false}
        />

        <div className="space-y-4">
          <Heading id="sign-in-hero-heading" sectionTitle>
            {t("heroTitle")}
          </Heading>
          <Paragraph className="text-sm leading-relaxed text-white/85 sm:text-[0.9375rem]">{t("heroLead")}</Paragraph>
        </div>

        <ul className="mt-8 list-none space-y-4 p-0">
          <li className="flex gap-3">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--brand)]" aria-hidden />
            <Paragraph className="text-sm leading-relaxed font-normal text-white/85 sm:text-[0.9375rem]">
              {t("heroPoint1")}
            </Paragraph>
          </li>
          <li className="flex gap-3">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--brand)]" aria-hidden />
            <Paragraph className="text-sm leading-relaxed font-normal text-white/85 sm:text-[0.9375rem]">
              {t("heroPoint2")}
            </Paragraph>
          </li>
          <li className="flex gap-3">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--brand)]" aria-hidden />
            <Paragraph className="text-sm leading-relaxed font-normal text-white/85 sm:text-[0.9375rem]">
              {t("heroPoint3")}
            </Paragraph>
          </li>
        </ul>
      </div>
    </section>
  );
}
