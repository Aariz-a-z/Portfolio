import type { MetadataRoute } from 'next';

import { absoluteUrl } from '@/data/site';

/**
 * A sitemap reference is emitted only once a real domain exists, since a
 * sitemap URL is necessarily absolute and pointing crawlers at a placeholder
 * origin is worse than omitting the line.
 */
export default function robots(): MetadataRoute.Robots {
  const sitemap = absoluteUrl('/sitemap.xml');

  return {
    rules: { userAgent: '*', allow: '/' },
    ...(sitemap ? { sitemap } : {}),
  };
}
