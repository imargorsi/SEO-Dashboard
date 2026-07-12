import Image from "next/image";

import { cn } from "@/lib/utils";

type AppLogoProps = {
  alt?: string;
  className?: string;
  height?: number;
  priority?: boolean;
  width?: number;
};

export function AppLogo({
  alt = "",
  className,
  height = 24,
  priority = false,
  width = 60,
}: AppLogoProps) {
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
