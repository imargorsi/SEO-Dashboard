import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { AppProviders } from "@/components/providers/app-providers";
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
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
