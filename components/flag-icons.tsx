/** National flag SVGs — hardcoded fills are intentional for accurate flag colors. */
export function FlagUnitedKingdom({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 14" className={className} aria-hidden>
      <rect width="20" height="14" rx="1.5" fill="#012169" />
      <path d="M0 0l20 14M20 0L0 14" stroke="#fff" strokeWidth="2.2" />
      <path d="M0 0l20 14M20 0L0 14" stroke="#C8102E" strokeWidth="1" />
      <path d="M10 0v14M0 7h20" stroke="#fff" strokeWidth="3.2" />
      <path d="M10 0v14M0 7h20" stroke="#C8102E" strokeWidth="1.8" />
    </svg>
  );
}

export function FlagSaudiArabia({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 14" className={className} aria-hidden>
      <rect width="20" height="14" rx="1.5" fill="#006C35" />
      <path
        d="M4.5 7.2c.4-.1.8-.3 1-.6.3-.4.3-.9.1-1.3-.2-.5-.6-.8-1.1-.9-.7-.1-1.3.2-1.6.7-.2.3-.3.7-.2 1.1h.9c0-.2.1-.4.3-.6.2-.2.4-.2.6-.2.3 0 .5.1.6.3.1.2 0 .4-.2.5-.2.1-.4.1-.6.1H4.1v.8h.4zm2.1-2.4H5.7v3.2h.9V4.8zm1.5 0c-.5 0-.9.3-.9.8v1.7c0 .5.4.8.9.8h.7c.5 0 .9-.3.9-.8V5.6c0-.5-.4-.8-.9-.8h-.7zm0 .8h.7v1.7h-.7V5.6zm1.8 0H9.2v3.2h1.8v-.8h-.9V5.6zm1.8 0h-.9l.9 3.2h.9l.9-3.2h-.9l-.4 1.4-.3-1.4z"
        fill="#fff"
      />
      <path
        d="M14.8 8.8c-.2.4-.7.7-1.2.8-.6.1-1.1-.2-1.4-.7-.3-.5-.3-1.2 0-1.7.3-.5.8-.8 1.4-.7.5.1.9.4 1.2.8l.8-.6c-.4-.6-1.1-1-1.9-1.1-1-.2-1.9.3-2.4 1.1-.5.9-.5 2 0 2.9.5.9 1.4 1.3 2.4 1.1.8-.1 1.5-.5 1.9-1.1l-.8-.5z"
        fill="#fff"
      />
    </svg>
  );
}
