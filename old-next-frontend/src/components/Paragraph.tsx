import cn from "clsx"
import type { FC, ReactNode } from "react"

interface IParagraph {
  children: ReactNode
  className?: string
  IsYellow?: boolean
  larger?: boolean
  smaller?: boolean
  medium?: boolean
  moreSmaller?: boolean
  invertColors?: boolean
}

export const Paragraph: FC<IParagraph> = (props) => {
  const {
    children,
    className,
    larger,
    IsYellow = false,
    smaller,
    invertColors,
    medium,
    moreSmaller,
  } = props

  const getTextSize = () => {
    if (larger) return "text-sm lg:text-[1.5rem] !leading-[2.25rem] font-medium"
    if (medium) return "text-sm lg:text-[1.25rem] !leading-[2rem] font-medium"
    if (smaller) return "text-sm lg:text-[1.125rem] !leading-[2rem] font-normal"
    if (moreSmaller) return "text-xs lg:text-[16px]"
    return "text-sm lg:text-base font-medium"
  }

  return (
    <p
      className={cn(
        getTextSize(),
        invertColors
          ? "text-[var(--text-on-strong)]"
          : IsYellow
            ? "text-[var(--brand)]"
            : "text-[var(--text)]",
        className,
      )}
    >
      {children}
    </p>
  )
}
