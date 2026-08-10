/** Soft brand orbs behind dense dashboard pages (Analytics + Dashboard home). */
export function PageAmbientGlow() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 h-128 overflow-hidden"
    >
      <div className="absolute -left-20 top-8 size-72 rounded-full bg-brand/12 blur-3xl motion-safe:animate-[page-ambient-drift-a_18s_ease-in-out_infinite]" />
      <div
        className="absolute -right-16 top-24 size-80 rounded-full blur-3xl motion-safe:animate-[page-ambient-drift-b_22s_ease-in-out_infinite]"
        style={{
          background: "color-mix(in srgb, var(--color-secondary) 14%, transparent)",
        }}
      />
      <div
        className="absolute left-1/3 top-0 h-40 w-2xl -translate-x-1/2 rounded-full blur-3xl motion-safe:animate-[page-ambient-drift-c_16s_ease-in-out_infinite]"
        style={{
          background: "color-mix(in srgb, var(--gradient-mid) 10%, transparent)",
        }}
      />
    </div>
  );
}
