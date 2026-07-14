import Image from "next/image";

import { cn } from "@/lib/utils";

type AppLogoProps = {
  alt?: string;
  className?: string;
  height?: number;
  priority?: boolean;
  /** `full` = wordmark; `mark` = brand icon only (favicon). */
  variant?: "full" | "mark";
  width?: number;
};

export function AppLogo({
  alt = "",
  className,
  height = 24,
  priority = false,
  variant = "full",
  width = 60,
}: AppLogoProps) {
  if (variant === "mark") {
    return (
      <Image
        src="/favicon.svg"
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        className={cn(className)}
        aria-hidden={alt ? undefined : true}
      />
    );
  }

  return (
    <>
      <Image
        src="/light-logo.svg"
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        className={cn(className, "dark:hidden")}
        aria-hidden={alt ? undefined : true}
      />
      <Image
        src="/Logo.svg"
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        className={cn(className, "hidden dark:block")}
        aria-hidden={alt ? undefined : true}
      />
    </>
  );
}
