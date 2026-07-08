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
      className="relative flex flex-1 flex-col justify-center bg-transparent px-6 py-10 sm:px-10 lg:px-14 lg:py-12"
      aria-labelledby={ariaLabelledBy}
    >
      {topToolbar ? (
        <div className="pointer-events-auto absolute inset-e-3 top-3 z-10 flex items-center gap-1 sm:inset-e-5 sm:top-5">
          {topToolbar}
        </div>
      ) : null}
      <div className="mx-auto w-full max-w-104">
        <div className="rounded-2xl border border-border bg-bg-card p-7 shadow-sm sm:p-8">
          {children}
        </div>
      </div>
    </section>
  );
}
