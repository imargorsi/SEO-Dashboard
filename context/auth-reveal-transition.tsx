"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { createPortal, flushSync } from "react-dom";
import { useRouter } from "next/navigation";
import { AUTH_REVEAL_TOTAL_MS } from "@/lib/frontend/auth/auth-reveal-timing";
import { SignInHeroSection } from "@/sections/sign-in-hero-section";

type AuthRevealContextValue = {
  isRevealing: boolean;
  armAuthReveal: () => void;
  disarmAuthReveal: () => void;
  beginAuthReveal: (path: string) => void;
};

const AuthRevealContext = createContext<AuthRevealContextValue | null>(null);

/** Blocks GuestOnly redirect while login is in-flight or the reveal overlay is active. */
const AuthRevealActiveContext = createContext(false);

function useCanUseDomPortal() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

function AuthRevealFormPanel() {
  return (
    <section className="flex h-full flex-1 flex-col justify-center bg-[var(--bg)] px-6 py-10 sm:px-10 lg:px-14 lg:py-12">
      <div className="mx-auto w-full max-w-[26rem]">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-7 shadow-sm sm:p-8">
          <div className="h-8 w-32 rounded-md bg-[var(--border)]/60" aria-hidden />
          <div className="mt-2 h-4 w-56 max-w-full rounded-md bg-[var(--border)]/40" aria-hidden />
          <div className="mt-8 space-y-5">
            <div className="h-10 rounded-md border border-[var(--border)] bg-[var(--bg)]" aria-hidden />
            <div className="h-10 rounded-md border border-[var(--border)] bg-[var(--bg)]" aria-hidden />
            <div className="h-10 rounded-md bg-[var(--brand)]/90" aria-hidden />
          </div>
        </div>
      </div>
    </section>
  );
}

function AuthRevealOverlay() {
  return (
    <div className="auth-reveal-overlay" aria-hidden>
      <div className="auth-reveal-panel auth-reveal-panel--hero">
        <SignInHeroSection />
      </div>
      <div className="auth-reveal-panel auth-reveal-panel--form">
        <AuthRevealFormPanel />
      </div>
    </div>
  );
}

export function AuthRevealProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const canPortal = useCanUseDomPortal();
  const [isRevealing, setIsRevealing] = useState(false);
  const [isRevealArmed, setIsRevealArmed] = useState(false);
  const endTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navFrameRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (endTimerRef.current) clearTimeout(endTimerRef.current);
      if (navFrameRef.current !== null) cancelAnimationFrame(navFrameRef.current);
    };
  }, []);

  const armAuthReveal = useCallback(() => {
    setIsRevealArmed(true);
  }, []);

  const disarmAuthReveal = useCallback(() => {
    setIsRevealArmed(false);
  }, []);

  const beginAuthReveal = useCallback(
    (path: string) => {
      if (!path) return;

      if (endTimerRef.current) clearTimeout(endTimerRef.current);
      if (navFrameRef.current !== null) cancelAnimationFrame(navFrameRef.current);

      setIsRevealArmed(false);

      const reducedMotion =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (reducedMotion) {
        router.push(path);
        return;
      }

      flushSync(() => {
        setIsRevealing(true);
      });

      navFrameRef.current = requestAnimationFrame(() => {
        navFrameRef.current = null;
        router.push(path);
      });

      endTimerRef.current = setTimeout(() => {
        setIsRevealing(false);
        endTimerRef.current = null;
      }, AUTH_REVEAL_TOTAL_MS);
    },
    [router]
  );

  useEffect(() => {
    if (!isRevealing) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isRevealing]);

  const isRevealActive = isRevealing || isRevealArmed;

  const value = useMemo<AuthRevealContextValue>(
    () => ({
      isRevealing,
      armAuthReveal,
      disarmAuthReveal,
      beginAuthReveal,
    }),
    [armAuthReveal, beginAuthReveal, disarmAuthReveal, isRevealing]
  );

  return (
    <AuthRevealContext.Provider value={value}>
      <AuthRevealActiveContext.Provider value={isRevealActive}>
        {children}
        {canPortal && isRevealing ? createPortal(<AuthRevealOverlay />, document.body) : null}
      </AuthRevealActiveContext.Provider>
    </AuthRevealContext.Provider>
  );
}

export function useAuthReveal() {
  const ctx = useContext(AuthRevealContext);
  if (!ctx) {
    throw new Error("useAuthReveal must be used within AuthRevealProvider");
  }
  return ctx;
}

export function useIsAuthRevealing(): boolean {
  return useContext(AuthRevealContext)?.isRevealing ?? false;
}

/** True while login is in-flight or the post-login reveal animation is running. */
export function useIsAuthRevealActive(): boolean {
  return useContext(AuthRevealActiveContext);
}
