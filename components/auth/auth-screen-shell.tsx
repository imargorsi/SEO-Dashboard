import type { ReactNode } from "react";

import { AuthVideoBackground } from "@/components/auth/auth-video-background";
import { SignInHeroSection } from "@/sections/sign-in-hero-section";
import { authFormPanelClass } from "@/lib/frontend/layout/auth-chrome";

type AuthScreenShellProps = {
  children: ReactNode;
};

export function AuthScreenShell({ children }: AuthScreenShellProps) {
  return (
    <main className="relative flex min-h-0 flex-1 flex-col lg:flex-row-reverse">
      <AuthVideoBackground />
      <div className={authFormPanelClass}>{children}</div>
      <SignInHeroSection />
    </main>
  );
}
