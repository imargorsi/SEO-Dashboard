import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["wink-nlp", "wink-eng-lite-web-model"],
  turbopack: {
    root: import.meta.dirname,
  },
  async headers() {
    // Hostinger/LiteSpeed often long-caches HTML while hashed chunks change on deploy.
    // Keep documents + APIs fresh; only immutable-cache content-hashed static assets.
    return [
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "private, no-store",
          },
        ],
      },
      {
        source: "/((?!_next/static|_next/image|api/).*)",
        headers: [
          {
            key: "Cache-Control",
            value: "private, no-cache, no-store, max-age=0, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
