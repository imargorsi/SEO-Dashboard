import type { Metadata } from "next";
import Script from "next/script";
import { Plus_Jakarta_Sans } from "next/font/google";
import { AppProviders } from "@/components/providers/app-providers";
import { THEME_PACK_BOOTSTRAP_SCRIPT } from "@/lib/frontend/theme/theme-packs";
import "./globals.css";

export const metadata: Metadata = {
  title: "SEO Dashboard",
  description: "SEO Dashboard",
  icons: {
    icon: "/favicon.svg",
  },
};

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  fallback: ["Plus Jakarta Sans Fallback", "sans-serif"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${plusJakartaSans.className} min-h-svh antialiased`}>
        {/* Do not set data-theme in JSX — React would reset it over localStorage / Settings. */}
        <Script
          id="theme-pack-bootstrap"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: THEME_PACK_BOOTSTRAP_SCRIPT }}
        />
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
