import { useId, useRef } from "react"
import { ImageIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export type ProfileImagePickerProps = {
  /** Resolved URL for preview (remote or object URL). */
  previewSrc: string | null
  onFileSelect: (file: File | null) => void
  /** When true, show control to discard a newly chosen file (revert to server image). */
  showClearPending?: boolean
  disabled?: boolean
  pickLabel: string
  changeLabel: string
  clearLabel: string
  className?: string
}

export function ProfileImagePicker({
  previewSrc,
  onFileSelect,
  showClearPending = false,
  disabled = false,
  pickLabel,
  changeLabel,
  clearLabel,
  className,
}: ProfileImagePickerProps) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)

  const hasPreview = Boolean(previewSrc)

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/*"
        className="sr-only"
        disabled={disabled}
        onChange={(e) => {
          const file = e.target.files?.[0] ?? null
          onFileSelect(file)
        }}
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "group relative size-36 shrink-0 rounded-full border-2 border-dashed border-[color-mix(in_srgb,var(--brand)_42%,transparent)] bg-[color-mix(in_srgb,var(--social-bg)_88%,var(--bg))] p-1.5 shadow-sm transition hover:border-[color-mix(in_srgb,var(--brand)_65%,transparent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)] disabled:pointer-events-none disabled:opacity-60 dark:border-orange-300/35 dark:bg-white/[0.06]",
        )}
        aria-label={hasPreview ? changeLabel : pickLabel}
      >
        <span
          className="flex size-full items-center justify-center overflow-hidden rounded-full border-4 border-white bg-[color-mix(in_srgb,var(--muted)_92%,var(--bg-elevated))] shadow-inner dark:border-white/90 dark:bg-zinc-800/80"
          aria-hidden
        >
          {previewSrc ? (
            <img
              src={previewSrc}
              alt=""
              className="size-full object-cover"
            />
          ) : (
            <span className="rounded-xl bg-white p-2.5 shadow-md ring-1 ring-black/5 dark:bg-zinc-100 dark:ring-white/10">
              <ImageIcon
                className="size-7 text-zinc-500 dark:text-zinc-600"
                strokeWidth={1.5}
                aria-hidden
              />
            </span>
          )}
        </span>
      </button>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className="text-sm font-medium text-[var(--brand)] underline-offset-2 hover:underline"
        >
          {hasPreview ? changeLabel : pickLabel}
        </button>
        {hasPreview && showClearPending ? (
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              onFileSelect(null)
              if (inputRef.current) inputRef.current.value = ""
            }}
            className="text-sm font-medium text-[var(--text-muted)] underline-offset-2 hover:text-[var(--text-h)] hover:underline"
          >
            {clearLabel}
          </button>
        ) : null}
      </div>
    </div>
  )
}
