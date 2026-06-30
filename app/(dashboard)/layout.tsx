import { EmailVerificationBanner } from "@/components/auth/email-verification-banner";
import { RequireAuth } from "@/components/auth/auth-guard";
import { DashboardHeader } from "@/components/layout/dashboard-header";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RequireAuth>
      <div className="flex min-h-svh flex-col md:flex-row">
        <div className="relative flex min-w-0 flex-1 flex-col">
          <DashboardHeader />
          <EmailVerificationBanner />
          <main className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</main>
        </div>
      </div>
    </RequireAuth>
  );
}
