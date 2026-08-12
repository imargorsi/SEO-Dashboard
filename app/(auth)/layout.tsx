import { GuestOnly } from "@/components/auth/auth-guard";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-svh flex-col bg-transparent">
      <GuestOnly>{children}</GuestOnly>
    </div>
  );
}
