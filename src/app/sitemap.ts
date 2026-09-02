import type { MetadataRoute } from 'next';

import { absoluteUrl } from '@/data/site';

/**
 * Both routes, or nothing.
 *
 * Sitemap entries must be absolute URLs. Until a real domain is set, emitting
 * entries built on a placeholder origin would publish a sitemap full of URLs
 * that resolve nowhere, so the sitemap is empty instead and the build warning
 * covers the gap.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const home = absoluteUrl('/');
  const resume = absoluteUrl('/resume');

  if (!home || !resume) return [];

  const lastModified = new Date();

  return [
    { url: home, lastModified, changeFrequency: 'monthly', priority: 1 },
    { url: resume, lastModified, changeFrequency: 'monthly', priority: 0.8 },
  ];
}
