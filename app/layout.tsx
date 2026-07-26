import type { Metadata } from "next";
import Script from "next/script";
import { Inter, Nunito, Plus_Jakarta_Sans, Ubuntu } from "next/font/google";
import { AppProviders } from "@/components/providers/app-providers";
import { FONT_PACK_BOOTSTRAP_SCRIPT } from "@/lib/frontend/theme/font-packs";
import { THEME_PACK_BOOTSTRAP_SCRIPT } from "@/lib/frontend/theme/theme-packs";
import "./globals.css";

export const metadata: Metadata = {
  title: "SEO Dashboard",
  description: "SEO Dashboard",
  icons: {
    icon: "/favicon.svg",
  },
};

const fontJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jakarta",
  fallback: ["Arial", "sans-serif"],
});

const fontUbuntu = Ubuntu({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-ubuntu",
  fallback: ["Arial", "sans-serif"],
});

const fontNunito = Nunito({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-nunito",
  fallback: ["Arial", "sans-serif"],
});

const fontInter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  fallback: ["Arial", "sans-serif"],
});

const fontVariableClassName = [
  fontJakarta.variable,
  fontUbuntu.variable,
  fontNunito.variable,
  fontInter.variable,
].join(" ");

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={fontVariableClassName} suppressHydrationWarning>
      <body className="min-h-svh font-sans antialiased">
        {/* Do not set data-theme / data-font in JSX — React would reset localStorage. */}
        <Script
          id="theme-pack-bootstrap"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: THEME_PACK_BOOTSTRAP_SCRIPT }}
        />
        <Script
          id="font-pack-bootstrap"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: FONT_PACK_BOOTSTRAP_SCRIPT }}
        />
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
