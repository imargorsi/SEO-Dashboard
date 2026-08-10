"use client";

import { IoSparklesOutline } from "react-icons/io5";

import { cn } from "@/lib/utils";

type TAssistantSparkleIconProps = {
  className?: string;
};

/** Soft twinkle for the Dashboard Assistant header icon (CSS, no Lottie). */
export function AssistantSparkleIcon({ className }: TAssistantSparkleIconProps) {
  return (
    <span className={cn("relative inline-flex size-6 items-center justify-center", className)}>
      <IoSparklesOutline
        className="size-6 text-text-primary motion-safe:animate-[assistant-sparkle-pulse_2.4s_ease-in-out_infinite]"
        aria-hidden
      />
      <IoSparklesOutline
        className="pointer-events-none absolute inset-0 size-6 text-text-primary opacity-40 motion-safe:animate-[assistant-sparkle-twinkle_1.8s_ease-in-out_infinite]"
        aria-hidden
      />
    </span>
  );
}
