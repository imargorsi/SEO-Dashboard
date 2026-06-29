import { Check, User } from "lucide-react"
import { cn } from "@/lib/utils"

type SidebarUserAvatarProps = {
  name: string
  /** When set, shows a small verified badge on the avatar. */
  verified?: boolean
  /** Compact sidebar uses `sm`. */
  size?: "sm" | "md"
  className?: string
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function SidebarUserAvatar({
  name,
  verified = false,
  size = "md",
  className,
}: SidebarUserAvatarProps) {
  const initials = initialsFromName(name)

  const box =
    size === "sm"
      ? "size-8 rounded-md text-[0.5625rem]"
      : "size-10 rounded-lg text-[0.6875rem]"
  const userIcon = size === "sm" ? "size-4" : "size-5"
  const badgeWrap =
    size === "sm"
      ? "size-3.5 -end-px -bottom-px"
      : "size-4 -end-0.5 -bottom-0.5"
  const checkIcon = size === "sm" ? "size-2" : "size-2.5"

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden bg-gradient-to-br from-[var(--brand)] via-[#6366f1] to-[#1e3a8a] font-semibold text-[var(--text-on-strong)] shadow-sm",
        box,
        className,
      )}
      aria-hidden
    >
      {initials.length > 0 && initials !== "?" ? (
        <span className="select-none">{initials}</span>
      ) : (
        <User className={cn(userIcon, "opacity-90")} strokeWidth={1.75} />
      )}
      {verified ? (
        <span
          className={cn(
            "absolute flex items-center justify-center rounded-full border border-[var(--social-bg)] bg-[var(--bg-elevated)] text-[var(--text-h)]",
            badgeWrap,
          )}
          aria-hidden
        >
          <Check className={cn(checkIcon, "stroke-[2.5]")} aria-hidden />
        </span>
      ) : null}
    </div>
  )
}
