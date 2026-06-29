/**
 * Theme-aware ornaments for the sign-in form column (fills empty corners).
 */
export function SignInAmbientDecor() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      <div
        className="absolute inset-0 opacity-[var(--signin-grid-opacity)]"
        style={{
          backgroundImage: `radial-gradient(var(--signin-grid-dot) 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
        }}
      />

      <div
        className="absolute -top-28 -start-28 size-[20rem] rounded-full opacity-[var(--signin-blob-1-opacity)] blur-3xl"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--brand) 55%, transparent) 0%, transparent 68%)",
        }}
      />
      <div className="signin-decor-frame absolute top-8 start-6 will-change-transform">
        <div className="relative size-36 rotate-[-8deg] rounded-[2rem] border-2 border-[var(--signin-decor-border)] shadow-[0_0_20px_-6px_color-mix(in_srgb,var(--signin-decor-border)_40%,transparent)]" />
        <div className="absolute top-[3rem] start-[3.5rem] size-2.5 rounded-full bg-[var(--brand)] opacity-70 shadow-[0_0_20px_color-mix(in_srgb,var(--brand)_55%,transparent)]" />
      </div>
      <div className="absolute top-36 start-10 h-px w-24 bg-gradient-to-e from-[var(--signin-decor-border)] to-transparent opacity-70" />

      <div
        className="absolute -bottom-36 -end-40 size-[24rem] rounded-full opacity-[var(--signin-blob-2-opacity)] blur-3xl"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--brand) 45%, transparent) 0%, transparent 70%)",
        }}
      />
      <div className="signin-decor-ring-wrap absolute bottom-10 end-8 size-44 will-change-transform">
        <div className="signin-decor-dashed-ring size-full rounded-full border-2 border-dashed border-[var(--signin-decor-border)] opacity-90 shadow-[0_0_22px_-4px_color-mix(in_srgb,var(--signin-decor-border)_45%,transparent)]" />
      </div>
      <div className="absolute bottom-24 end-20 size-3 rounded-full border-2 border-[var(--brand)] opacity-50" />
      <div className="absolute bottom-32 end-14 h-20 w-px bg-gradient-to-b from-transparent via-[var(--signin-decor-border)] to-transparent opacity-60" />
    </div>
  )
}
