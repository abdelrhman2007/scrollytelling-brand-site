import type { NextConfig } from "next";

type RemotePattern = NonNullable<NonNullable<NextConfig["images"]>["remotePatterns"]>[number];

/** CMS media are absolute URLs on the CMS host — allow them through next/image. */
function cmsImagePatterns(): RemotePattern[] {
  const urls = [process.env.CMS_URL];
  if (process.env.NODE_ENV !== "production") urls.push("http://localhost:5080");

  const patterns: RemotePattern[] = [];
  for (const raw of urls) {
    if (!raw) continue;
    try {
      const u = new URL(raw);
      const pattern: RemotePattern = {
        protocol: u.protocol.replace(":", "") as "http" | "https",
        hostname: u.hostname,
        port: u.port,
        pathname: "/**",
      };
      if (!patterns.some((p) => p.hostname === pattern.hostname && p.port === pattern.port && p.protocol === pattern.protocol))
        patterns.push(pattern);
    } catch {
      // Ignore a malformed CMS_URL — the site still builds with local content.
    }
  }
  return patterns;
}

const YEAR = 60 * 60 * 24 * 365;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  outputFileTracingRoot: __dirname,
  compiler: {
    // Production bundles ship without console noise (errors are kept).
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error"] } : false,
  },
  images: {
    // WebP only: sources are already WebP, and on-the-fly AVIF encoding makes
    // the first request for each size take seconds of server CPU.
    formats: ["image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: cmsImagePatterns(),
  },
  async redirects() {
    // First version of the cards lived under /c/ — keep any shared links working.
    return [{ source: "/c/:slug", destination: "/:slug", permanent: true }];
  },
  async headers() {
    return [
      {
        // Brand/work images are content-addressed by name and rarely change.
        source: "/images/:path*",
        headers: [{ key: "Cache-Control", value: `public, max-age=${60 * 60 * 24 * 30}, stale-while-revalidate=${YEAR}` }],
      },
      {
        // Private contact cards: never indexed or cached by shared caches, and
        // the URL (the only "key") never leaks to other sites via Referer.
        // Every root address that could be a card (single lowercase segment,
        // not a real page) and its /vcard file.
        source: "/:slug((?!about$|works$|c$|api$|images$|models$)[a-z0-9][a-z0-9-]*[a-z0-9]):rest(/vcard)?",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "Cache-Control", value: "private, no-store" },
        ],
      },
    ];
  },
};

export default nextConfig;
