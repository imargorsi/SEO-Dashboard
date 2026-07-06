import type { ReactNode } from "react";

type SignInAuthCardShellProps = {
  ariaLabelledBy: string;
  children: ReactNode;
  /** Theme + language — fixed top-end of the auth column (above the card) */
  topToolbar?: ReactNode;
};

export function SignInAuthCardShell({ ariaLabelledBy, children, topToolbar }: SignInAuthCardShellProps) {
  return (
    <section
      className="relative flex flex-1 flex-col justify-center bg-[var(--bg)] px-6 py-10 sm:px-10 lg:px-14 lg:py-12"
      aria-labelledby={ariaLabelledBy}
    >
      {topToolbar ? (
        <div className="pointer-events-auto absolute end-3 top-3 z-10 flex items-center gap-1 sm:end-5 sm:top-5">
          {topToolbar}
        </div>
      ) : null}
      <div className="mx-auto w-full max-w-[26rem]">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-7 shadow-sm sm:p-8">
          {children}
        </div>
      </div>
    </section>
  );
}
