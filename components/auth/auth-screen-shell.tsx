import type { ReactNode } from "react";
import { SignInHeroSection } from "@/sections/sign-in-hero-section";

type AuthScreenShellProps = {
  children: ReactNode;
};

export function AuthScreenShell({ children }: AuthScreenShellProps) {
  return (
    <main className="flex min-h-0 flex-1 flex-col lg:flex-row-reverse">
      {children}
      <div
        aria-hidden
        className="hidden w-px flex-none self-stretch bg-border lg:block"
      />
      <SignInHeroSection />
    </main>
  );
}
