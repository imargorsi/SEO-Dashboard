export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-svh flex-col bg-[var(--bg)]">
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
