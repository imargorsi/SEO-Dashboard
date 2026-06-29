import cn from "clsx"
import type { FC, ReactNode } from "react"

interface IHeading {
  children: ReactNode
  id?: string
  className?: string
  heroTitle?: boolean
  mediumTitle?: boolean
  SmallTitle?: boolean
  invertColors?: boolean
  font?: string
  bold?: string
  isMainHeading?: boolean
  /** Compact h1 for auth / app pages (uses theme tokens). */
  pageTitle?: boolean
  /** Compact h2 for supporting panels (uses theme tokens). */
  sectionTitle?: boolean
  customHeadingTag?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
}

export const Heading: FC<IHeading> = (props) => {
  const {
    children,
    id,
    className,
    heroTitle,
    mediumTitle,
    invertColors,
    font,
    bold,
    isMainHeading,
    SmallTitle,
    customHeadingTag,
    pageTitle,
    sectionTitle,
  } = props

  const getTextSizes = () => {
    if (pageTitle) {
      return "text-2xl font-semibold tracking-tight text-[var(--text-h)] sm:text-[1.75rem] leading-snug"
    }
    if (sectionTitle) {
      return "text-xl font-semibold tracking-tight text-[var(--text-h)] sm:text-2xl leading-snug"
    }
    if (isMainHeading)
      return "text-2xl lg:text-[3.5rem]  !font-bold leading-[1.1] lg:leading-[4.5rem]"
    if (heroTitle)
      return "text-2xl lg:text-[3.5rem]  !font-bold leading-[1.1] lg:leading-[4.5rem]"
    if (mediumTitle)
      return "text-[1.375rem] lg:text-[2.625rem] font-semibold leading-[3.5rem] "
    if (SmallTitle)
      return "text-[1.375rem] lg:text-[1.875rem] font-semibold leading-[2.75rem]"
    return "text-[22px] lg:text-3xl font-bold capitalize"
  }

  const HeadingTag =
    customHeadingTag ||
    (pageTitle ? "h1" : sectionTitle ? "h2" : isMainHeading ? "h1" : heroTitle || mediumTitle ? "h2" : "h3")

  return (
    <HeadingTag
      id={id}
      className={cn(
        font || "font-sans",
        pageTitle || sectionTitle ? null : bold || "font-semibold",
        getTextSizes(),
        invertColors
          ? "text-[var(--text-on-strong)]"
          : "text-[var(--text-h)]",
        className,
      )}
    >
      {children}
    </HeadingTag>
  )
}
