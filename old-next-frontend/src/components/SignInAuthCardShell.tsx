import type { ReactNode } from "react"
import { SignInAmbientDecor } from "@/components/SignInAmbientDecor.tsx"

type SignInAuthCardShellProps = {
  ariaLabelledBy: string
  children: ReactNode
  /** Theme + language — fixed top-end of the auth column (above the card) */
  topToolbar?: ReactNode
}

export function SignInAuthCardShell({
  ariaLabelledBy,
  children,
  topToolbar,
}: SignInAuthCardShellProps) {
  return (
    <section
      className="relative flex flex-1 flex-col justify-center overflow-hidden bg-[var(--bg)] px-6 py-10 sm:px-10 lg:px-14 lg:py-12"
      aria-labelledby={ariaLabelledBy}
    >
      <SignInAmbientDecor />
      {topToolbar ? (
        <div className="pointer-events-auto absolute top-3 end-3 z-30 flex items-center gap-1 sm:top-5 sm:end-5">
          {topToolbar}
        </div>
      ) : null}
      <div className="relative z-10 mx-auto w-full max-w-[26rem]">
        <div className="rounded-2xl border border-[var(--signin-glass-border)] bg-[var(--signin-glass-bg)] p-7 shadow-[var(--signin-glass-shadow)] backdrop-blur-2xl backdrop-saturate-150 sm:p-8">
          {children}
        </div>
      </div>
    </section>
  )
}
