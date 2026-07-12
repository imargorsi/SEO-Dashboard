import type { ReactNode } from "react";

import { authFormCardSurfaceClass } from "@/lib/frontend/layout/auth-chrome";
import { cn } from "@/lib/utils";

type SignInAuthCardShellProps = {
  ariaLabelledBy: string;
  children: ReactNode;
  /** Language switcher — top-end inside the auth card */
  topToolbar?: ReactNode;
};

export function SignInAuthCardShell({ ariaLabelledBy, children, topToolbar }: SignInAuthCardShellProps) {
  return (
    <section
      className="relative flex flex-1 flex-col justify-center bg-transparent px-6 py-10 sm:px-10 lg:px-14 lg:py-12"
      aria-labelledby={ariaLabelledBy}
    >
      <div className="mx-auto w-full max-w-104">
        <div className={cn(authFormCardSurfaceClass, "p-7 sm:p-8")}>
          {topToolbar ? <div className="-mt-1 mb-5 flex justify-end">{topToolbar}</div> : null}
          {children}
        </div>
      </div>
    </section>
  );
}
