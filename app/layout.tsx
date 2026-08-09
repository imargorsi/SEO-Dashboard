import type { Metadata } from "next";
import { Inter, Nunito, Plus_Jakarta_Sans, Ubuntu } from "next/font/google";
import { AppHydrationMarker } from "@/components/providers/app-hydration-marker";
import { AppProviders } from "@/components/providers/app-providers";
import { ERROR_COPY } from "@/lib/frontend/feedback/error-copy";
import { FONT_PACK_BOOTSTRAP_SCRIPT } from "@/lib/frontend/theme/font-packs";
import { THEME_PACK_BOOTSTRAP_SCRIPT } from "@/lib/frontend/theme/theme-packs";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Crawllex - SEO Clarity For Every Client",
    template: "%s | Crawllex",
  },
  description: "Crawllex - SEO Clarity For Every Client",
  metadataBase: new URL("https://crawllex.com"),
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png", sizes: "512x512" }],
    shortcut: "/favicon.png",
    apple: "/favicon.png",
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
        <div
          id="crawllex-boot-fallback"
          hidden
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `<div style="position:fixed;inset:0;z-index:999999999;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2rem;background:#060a18;color:#e6ebff;font-family:system-ui,sans-serif;text-align:center"><h1 style="font-size:1.25rem;font-weight:600;margin:0 0 0.75rem">${ERROR_COPY.title}</h1><p style="max-width:28rem;line-height:1.5;color:#9aa3b2;margin:0 0 1.5rem">${ERROR_COPY.description}</p><div style="display:flex;flex-wrap:wrap;gap:0.75rem;justify-content:center"><button type="button" id="crawllex-boot-retry" style="border:none;border-radius:0.75rem;padding:0.5rem 1rem;font-weight:600;cursor:pointer;background:#5ea0ff;color:#fff">${ERROR_COPY.tryAgain}</button><a href="/" style="border-radius:0.75rem;padding:0.5rem 1rem;font-weight:600;text-decoration:none;border:1px solid rgba(255,255,255,0.2);color:#e6ebff">${ERROR_COPY.goHome}</a></div></div>`,
          }}
        />
        {/* Native scripts avoid next/script client reconciliation warnings for beforeInteractive bootstraps. */}
        <script
          id="boot-watchdog"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `(function(){setTimeout(function(){if(document.documentElement.getAttribute("data-app-hydrated")==="true")return;var el=document.getElementById("crawllex-boot-fallback");if(!el)return;el.hidden=false;var retry=document.getElementById("crawllex-boot-retry");if(retry)retry.addEventListener("click",function(){location.reload();});},12000);})();`,
          }}
        />
        {/* Do not set data-theme / data-font in JSX — React would reset localStorage. */}
        <script
          id="theme-pack-bootstrap"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: THEME_PACK_BOOTSTRAP_SCRIPT }}
        />
        <script
          id="font-pack-bootstrap"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: FONT_PACK_BOOTSTRAP_SCRIPT }}
        />
        <AppProviders>
          <AppHydrationMarker />
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
