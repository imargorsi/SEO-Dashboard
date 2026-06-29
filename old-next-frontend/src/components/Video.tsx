'use client'

import cn from 'clsx'
import { forwardRef, useRef, useImperativeHandle } from 'react'

interface IVideo {
  src: string
  className?: string
  withSizeAnimation?: boolean
  autoPlay?: boolean
  playOnHover?: boolean
}

export const Video = forwardRef<HTMLVideoElement, IVideo>((props, ref) => {
  const { src, className, autoPlay, playOnHover } = props
  const internalRef = useRef<HTMLVideoElement>(null)

  useImperativeHandle(ref, () => internalRef.current as HTMLVideoElement, [])

  const handleMouseEnter = () => {
    if (playOnHover && internalRef.current) {
      internalRef.current.play()
    }
  }

  const handleMouseLeave = () => {
    if (playOnHover && internalRef.current) {
      internalRef.current.pause()
    }
  }

  const shouldAutoplay = playOnHover ? false : (autoPlay !== undefined ? autoPlay : true)

  return (
    <video
      ref={internalRef}
      className={cn('h-full w-full object-cover', className)}
      src={src}
      autoPlay={shouldAutoplay}
      loop
      muted
      playsInline
      onMouseEnter={playOnHover ? handleMouseEnter : undefined}
      onMouseLeave={playOnHover ? handleMouseLeave : undefined}
    />
  )
})

Video.displayName = 'Video'
