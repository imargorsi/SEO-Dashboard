"use client";

import { useEffect, useState } from "react";

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion.hook";

type TUseTypingPlaceholderOptions = {
  phrases: readonly string[];
  /** When false, freezes on an empty string (e.g. user is typing). */
  enabled?: boolean;
  typeMs?: number;
  deleteMs?: number;
  holdMs?: number;
};

/**
 * Loops a typewriter-style placeholder across `phrases`.
 * Honors `prefers-reduced-motion` by showing the first phrase statically.
 */
export function useTypingPlaceholder({
  phrases,
  enabled = true,
  typeMs = 42,
  deleteMs = 28,
  holdMs = 1600,
}: TUseTypingPlaceholderOptions): string {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const safePhrases = phrases.length > 0 ? phrases : [""];
  const activePhrase = safePhrases[phraseIndex % safePhrases.length] ?? "";

  useEffect(() => {
    if (!enabled || prefersReducedMotion || safePhrases.length === 0) return;

    if (!isDeleting && charCount === activePhrase.length) {
      const hold = window.setTimeout(() => setIsDeleting(true), holdMs);
      return () => window.clearTimeout(hold);
    }

    if (isDeleting && charCount === 0) {
      const next = window.setTimeout(() => {
        setIsDeleting(false);
        setPhraseIndex((index) => (index + 1) % safePhrases.length);
      }, 280);
      return () => window.clearTimeout(next);
    }

    const delay = isDeleting ? deleteMs : typeMs;
    const tick = window.setTimeout(() => {
      setCharCount((count) => count + (isDeleting ? -1 : 1));
    }, delay);

    return () => window.clearTimeout(tick);
  }, [
    activePhrase.length,
    charCount,
    deleteMs,
    enabled,
    holdMs,
    isDeleting,
    prefersReducedMotion,
    safePhrases.length,
    typeMs,
  ]);

  useEffect(() => {
    if (!enabled) {
      setCharCount(0);
      setIsDeleting(false);
    }
  }, [enabled]);

  if (!enabled) return "";
  if (prefersReducedMotion) return activePhrase;
  return activePhrase.slice(0, charCount);
}
