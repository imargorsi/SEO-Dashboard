import cn from "clsx"
import {
  forwardRef,
  type CSSProperties,
  type ReactNode,
} from "react"

interface ISection {
  children: ReactNode
  className?: string
  wrapperClassName?: string
  videoSrc?: string
  videoClassName?: string
  style?: CSSProperties
  withPadding?: boolean
  withoutMargin?: boolean
  withoutOverlay?: boolean
  backgroundSrc?: string
  backgroundClassName?: string
  custom?: boolean
  variant?: 'cozy' | 'fullscreen'
}

export const Section = forwardRef<HTMLElement, ISection>((props, ref) => {
  const {
    children,
    className,
    wrapperClassName,
    videoSrc,
    videoClassName,
    withPadding,
    style,
    withoutMargin,
    withoutOverlay,
    backgroundSrc,
    backgroundClassName,
    variant = 'cozy',
  } = props

  return (
    <section
      ref={ref}
      style={style}
      className={cn(' relative overflow-hidden', !withoutMargin && 'my-[3rem]', className)}
    >
      {videoSrc && (
        <>
          <video
            className={cn('absolute left-0 top-0 h-full w-full object-cover', videoClassName)}
            autoPlay
            muted
            loop
            controls={false}
            preload='metadata'
          >
            <source src={videoSrc} type='video/mp4' />
            Your browser does not support the video tag.
          </video>
          <div
            className={cn(
              'to-transparent absolute left-0 top-0 h-full w-full  bg-gradient-to-b from-white via-white/5',
              videoClassName,
              withoutOverlay && 'hidden',
            )}
          />
          <div
            className={cn(
              'to-transparent absolute -bottom-4 left-0 h-full w-full bg-gradient-to-t from-white via-white/5',
              videoClassName,
              withoutOverlay && 'hidden',
            )}
          />
        </>
      )}

      {backgroundSrc ? (
        <img
          className={cn(
            "absolute inset-0 z-0 h-full w-[650px] object-contain object-center",
            backgroundClassName,
          )}
          src={backgroundSrc}
          alt=""
        />
      ) : null}

      <div
        className={cn(
          'inner-wrapper',
          'h-full',
          variant === 'cozy' && 'mx-auto max-w-[1317px] px-4 lg:px-0',
          videoSrc && 'relative z-10',
          withPadding && 'mt-[3rem] lg:px-0 lg:mt-[10rem] ',
          wrapperClassName,
        )}
      >
        {children}
      </div>
    </section>
  )
})

Section.displayName = 'Section'
