type PlaceholderPageProps = {
  title: string;
};

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <p className="text-sm text-[var(--text-muted)]">{title} — migration pending</p>
    </div>
  );
}
