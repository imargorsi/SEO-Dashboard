import { useTranslation } from "react-i18next"
import { Heading } from "../components/Heading.tsx"
import { Paragraph } from "../components/Paragraph.tsx"

export function SignInHeroSection() {
  const { t } = useTranslation("translation", { keyPrefix: "auth.signIn" })
  const { t: tLayout } = useTranslation("translation", { keyPrefix: "layout" })

  return (
    <section
      className="relative flex flex-1 flex-col justify-center overflow-hidden border-[var(--border)] bg-black px-6 py-12 sm:px-10 lg:border-e lg:px-14 lg:py-16"
      aria-labelledby="sign-in-hero-heading"
    >
      <video
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        aria-hidden
      >
        <source src="/videos/login-video-2.mp4" type="video/mp4" />
      </video>
      <div
        className="pointer-events-none absolute inset-0 bg-black/45"
        aria-hidden
      />
      <div className="relative z-10 mx-auto w-full max-w-md space-y-6 text-white [&_h2]:!text-white [&_p]:!text-white">
        <div className="signin-hero-logo">
          <div className="signin-hero-logo__inner">
            <img
              src="/Logo.svg"
              alt={tLayout("appName")}
              className="signin-hero-logo__img"
              width={280}
              height={47}
              draggable={false}
            />
            <span className="signin-hero-logo__floor" aria-hidden />
          </div>
        </div>
        <Heading id="sign-in-hero-heading" sectionTitle>
          {t("heroTitle")}
        </Heading>
        <Paragraph className="text-sm leading-relaxed sm:text-[0.9375rem]">
          {t("heroLead")}
        </Paragraph>
        <ul className="list-none space-y-3 p-0">
          <li className="flex gap-3">
            <span
              className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[var(--brand)]"
              aria-hidden
            />
            <Paragraph className="text-sm font-normal leading-relaxed sm:text-[0.9375rem]">
              {t("heroPoint1")}
            </Paragraph>
          </li>
          <li className="flex gap-3">
            <span
              className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[var(--brand)]"
              aria-hidden
            />
            <Paragraph className="text-sm font-normal leading-relaxed sm:text-[0.9375rem]">
              {t("heroPoint2")}
            </Paragraph>
          </li>
          <li className="flex gap-3">
            <span
              className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[var(--brand)]"
              aria-hidden
            />
            <Paragraph className="text-sm font-normal leading-relaxed sm:text-[0.9375rem]">
              {t("heroPoint3")}
            </Paragraph>
          </li>
        </ul>
      </div>
    </section>
  )
}
