import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion } from "motion/react"

const POST_LOGIN_LOADING_MS = 2000
const FADE_TRANSITION_S = 0.5
const LOADING_VIDEO_SRC = "/videos/loading.mp4"

const fadeEase = [0.4, 0, 0.2, 1] as const

type PostLoginLoadingContextValue = {
  /** Full-screen fade loading (login → dashboard or logout → sign-in). */
  beginAuthTransition: () => void
}

const PostLoginLoadingContext = createContext<PostLoginLoadingContextValue | null>(
  null,
)

export function usePostLoginLoading() {
  const ctx = useContext(PostLoginLoadingContext)
  if (!ctx) {
    throw new Error("usePostLoginLoading must be used within PostLoginLoadingProvider")
  }
  return ctx
}

function PostLoginLoadingOverlay({
  show,
  videoRef,
}: {
  show: boolean
  videoRef: RefObject<HTMLVideoElement | null>
}) {
  return createPortal(
    <AnimatePresence mode="wait">
      {show ? (
        <motion.div
          key="post-login-loading-screen"
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-white"
          role="status"
          aria-live="polite"
          aria-busy="true"
          aria-label="Loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: FADE_TRANSITION_S, ease: fadeEase }}
        >
          <motion.video
            ref={videoRef}
            src={LOADING_VIDEO_SRC}
            className="size-[600px] object-contain"
            autoPlay
            muted
            playsInline
            loop
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: FADE_TRANSITION_S, ease: fadeEase, delay: 0.08 }}
          />
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}

export function PostLoginLoadingProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState(false)
  const endTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const clearEndTimer = useCallback(() => {
    if (endTimerRef.current != null) {
      clearTimeout(endTimerRef.current)
      endTimerRef.current = null
    }
  }, [])

  const beginAuthTransition = useCallback(() => {
    clearEndTimer()
    setActive(true)
    endTimerRef.current = setTimeout(() => {
      setActive(false)
      endTimerRef.current = null
    }, POST_LOGIN_LOADING_MS)
  }, [clearEndTimer])

  useEffect(() => () => clearEndTimer(), [clearEndTimer])

  useEffect(() => {
    if (!active) return
    const video = videoRef.current
    if (!video) return
    video.currentTime = 0
    void video.play().catch(() => {})
  }, [active])

  useEffect(() => {
    if (!active) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [active])

  return (
    <PostLoginLoadingContext value={{ beginAuthTransition }}>
      {children}
      <PostLoginLoadingOverlay show={active} videoRef={videoRef} />
    </PostLoginLoadingContext>
  )
}
