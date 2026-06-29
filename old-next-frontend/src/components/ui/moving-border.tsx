import {
  motion,
  useAnimationFrame,
  useMotionTemplate,
  useMotionValue,
  useTransform,
} from 'motion/react'
import {
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ElementType,
  type MouseEvent,
  type MouseEventHandler,
  type ReactNode,
  type SVGProps,
} from 'react'
import { cn } from '@/lib/utils'

type MovingBorderButtonProps<T extends ElementType = 'button'> = {
  borderRadius?: string
  children: ReactNode
  as?: T
  containerClassName?: string
  borderClassName?: string
  duration?: number
  className?: string
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'children' | 'className'>

export function Button<T extends ElementType = 'button'>({
  borderRadius = '1.75rem',
  children,
  as,
  containerClassName,
  borderClassName,
  duration,
  className,
  ...otherProps
}: MovingBorderButtonProps<T>) {
  const Component = (as ?? 'button') as ElementType
  const [hovered, setHovered] = useState(false)

  const {
    onMouseEnter: userOnMouseEnter,
    onMouseLeave: userOnMouseLeave,
    ...rest
  } = otherProps as typeof otherProps & {
    onMouseEnter?: MouseEventHandler
    onMouseLeave?: MouseEventHandler
  }

  const baseDuration = duration ?? 3000
  const hoverDuration = Math.max(1200, Math.round(baseDuration * 0.48))

  return (
    <Component
      className={cn(
        'group relative h-12 w-40 cursor-pointer overflow-hidden bg-transparent p-[1px] text-xl',
        'transition-[filter] duration-300 ease-out',
        'hover:brightness-[1.06] focus-visible:outline-none',
        containerClassName,
      )}
      style={{
        borderRadius,
      }}
      onMouseEnter={(e: MouseEvent<HTMLElement>) => {
        userOnMouseEnter?.(e)
        setHovered(true)
      }}
      onMouseLeave={(e: MouseEvent<HTMLElement>) => {
        userOnMouseLeave?.(e)
        setHovered(false)
      }}
      {...rest}
    >
      <div
        className="absolute inset-0 transition-opacity duration-300 ease-out group-hover:opacity-100"
        style={{ borderRadius: `calc(${borderRadius} * 0.96)` }}
      >
        <MovingBorder
          duration={hovered ? hoverDuration : baseDuration}
          rx="90%"
          ry="90%"
        >
          <div
            className={cn(
              'h-12 w-[10rem] opacity-[0.82] transition-[opacity,filter] duration-300 ease-out',
              'group-hover:opacity-100 group-hover:brightness-110 group-hover:saturate-125',
              borderClassName,
            )}
            style={{
              background:
                'radial-gradient(circle, var(--motion-orbit-color) 38%, transparent 62%)',
            }}
          />
        </MovingBorder>
      </div>

      <div
        className={cn(
          'relative flex h-full w-full items-center justify-center border border-[var(--motion-btn-border)] bg-[var(--motion-btn-bg)] text-sm font-medium text-[var(--motion-btn-fg)] antialiased backdrop-blur-xl',
          'transition-[transform,box-shadow,border-color,background-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
          'group-hover:-translate-y-0.5 group-hover:border-[color-mix(in_oklab,var(--motion-orbit-color)_42%,var(--motion-btn-border))]',
          'group-hover:shadow-[0_14px_36px_-12px_var(--motion-orbit-color)]',
          'group-active:translate-y-0 group-active:scale-[0.985] group-active:shadow-[0_6px_20px_-14px_var(--motion-orbit-color)]',
          'group-focus-visible:ring-2 group-focus-visible:ring-[var(--motion-orbit-color)] group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-[var(--motion-btn-bg)]',
          className,
        )}
        style={{
          borderRadius: `calc(${borderRadius} * 0.96)`,
        }}
      >
        {children}
      </div>
    </Component>
  )
}

type MovingBorderProps = {
  children: ReactNode
  duration?: number
  rx?: string
  ry?: string
} & SVGProps<SVGSVGElement>

export function MovingBorder({
  children,
  duration = 3000,
  rx,
  ry,
  ...otherProps
}: MovingBorderProps) {
  const pathRef = useRef<SVGRectElement | null>(null)
  const progress = useMotionValue(0)

  useAnimationFrame((time) => {
    const el = pathRef.current
    const length = el?.getTotalLength()
    if (length) {
      const pxPerMillisecond = length / duration
      progress.set((time * pxPerMillisecond) % length)
    }
  })

  const x = useTransform(progress, (val) => {
    const el = pathRef.current
    if (!el) return 0
    return el.getPointAtLength(val).x
  })
  const y = useTransform(progress, (val) => {
    const el = pathRef.current
    if (!el) return 0
    return el.getPointAtLength(val).y
  })

  const transform = useMotionTemplate`translateX(${x}px) translateY(${y}px) translateX(-50%) translateY(-50%)`

  return (
    <>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="absolute h-full w-full"
        width="100%"
        height="100%"
        {...otherProps}
      >
        <rect
          fill="none"
          width="100%"
          height="100%"
          rx={rx}
          ry={ry}
          ref={pathRef}
        />
      </svg>
      <motion.div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          display: 'inline-block',
          transform,
        }}
      >
        {children}
      </motion.div>
    </>
  )
}
