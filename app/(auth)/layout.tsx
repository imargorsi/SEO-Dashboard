import { GuestOnly } from "@/components/auth/auth-guard";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="dark flex min-h-svh flex-col bg-bg-main">
      <div className="flex min-h-0 flex-1 flex-col">
        <GuestOnly>{children}</GuestOnly>
      </div>
    </div>
  );
}
