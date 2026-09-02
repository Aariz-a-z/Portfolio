import type { NextConfig } from 'next';

import { SITE_URL } from './src/data/site';

/**
 * Build-time warning for an unset canonical origin.
 *
 * `SITE_URL` feeds the canonical link, Open Graph and Twitter URLs, the sitemap,
 * robots.txt and the JSON-LD `url`. Shipping it unset would publish a site whose
 * every absolute URL points at a placeholder, which is the kind of mistake that
 * is invisible in development and obvious in a search result.
 *
 * A warning rather than a thrown error, deliberately: development and preview
 * builds have to keep working before a domain exists.
 */
if (SITE_URL.includes('TODO_')) {
  console.warn(
    [
      '',
      '  ┌──────────────────────────────────────────────────────────────────────┐',
      '  │  SITE_URL is still a placeholder.                                    │',
      '  │                                                                      │',
      '  │  This does NOT block a deploy. On Vercel production builds the       │',
      '  │  origin falls back to VERCEL_PROJECT_PRODUCTION_URL, so canonical,   │',
      '  │  Open Graph, sitemap.xml and JSON-LD all resolve correctly.          │',
      '  │                                                                      │',
      '  │  To pin the final domain, do either one:                             │',
      '  │    • set SITE_URL in src/data/site.ts                                │',
      '  │    • or set NEXT_PUBLIC_SITE_URL in the environment                  │',
      '  └──────────────────────────────────────────────────────────────────────┘',
      '',
    ].join('\n'),
  );
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    /**
     * Inline the stylesheet into the document instead of linking it.
     *
     * The largest contentful paint here is text, so its paint is chained behind
     * the render-blocking stylesheet: Lighthouse attributes about 160ms plus a
     * round trip to that link. The whole stylesheet is roughly 8 KB, which is
     * small enough that inlining it costs less than the request it removes.
     */
    inlineCss: true,
  },
};

export default nextConfig;
