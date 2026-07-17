import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { AppProviders } from "@/components/providers/app-providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "SEO Dashboard",
  description: "SEO Dashboard",
  icons: {
    icon: "/favicon.svg",
  },
};

const nunito = Nunito({
  subsets: ["latin"],
  display: "swap",
  fallback: ["Nunito Fallback", "sans-serif"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${nunito.className} min-h-svh antialiased`}>
        <AppProviders>{children}</AppProviders>
        <SpeedInsights />
      </body>
    </html>
  );
}
