import type { ReactNode } from "react";

import { AuthVideoBackground } from "@/components/auth/auth-video-background";
import { SignInHeroSection } from "@/sections/sign-in-hero-section";

type AuthScreenShellProps = {
  children: ReactNode;
};

/**
 * Auth split layout — hero left, form right on desktop.
 * Both columns vertically center their content. Trust chips sit at the bottom of the hero.
 *
 * Form centering uses the min-h-full + items-center scroll pattern so the card
 * stays vertically centered when it fits, and scrolls from a sensible start when
 * it does not (plain items-center + overflow on the same node sticks to the top).
 */
export function AuthScreenShell({ children }: AuthScreenShellProps) {
  return (
    <main className="relative grid min-h-svh grid-cols-1 lg:h-svh lg:grid-cols-2 lg:overflow-hidden">
      <AuthVideoBackground />
      <SignInHeroSection />
      <div className="relative z-10 min-h-svh w-full overflow-y-auto lg:h-full lg:min-h-0">
        <div className="flex min-h-full w-full items-center justify-center px-5 py-10 sm:px-10 lg:px-12 lg:py-12">
          {children}
        </div>
      </div>
    </main>
  );
}
