import type { SiteConfig } from '@/types/content';

/**
 * The canonical origin, written in exactly one place.
 *
 * Canonical links, Open Graph and Twitter URLs, sitemap.xml, robots.txt and the
 * JSON-LD `url` all derive from here, so setting the real domain is a one-line
 * change that updates every absolute URL the site emits.
 *
 * TODO: replace with the final domain, e.g. 'https://aarizkhan.dev'.
 */
export const SITE_URL = 'TODO_FINAL_DOMAIN';

/** True while the constant above has not been given a real domain. */
export const isPlaceholderUrl = SITE_URL.includes('TODO_');

/**
 * Where the origin actually comes from at build time, in priority order.
 *
 * The placeholder must not block a deploy, and it must not degrade one either.
 * Shipping with no canonical, no Open Graph URL and an empty sitemap would be a
 * worse outcome than deploying a day later, so the origin falls back to whatever
 * the host already knows:
 *
 *   1. NEXT_PUBLIC_SITE_URL — an explicit override, works on any host
 *   2. VERCEL_PROJECT_PRODUCTION_URL — the stable production domain Vercel
 *      assigns, used only for production builds so that a preview deploy never
 *      claims to be canonical
 *   3. the SITE_URL constant above, once it is real
 *   4. nothing — and then absolute URLs are omitted rather than invented
 *
 * Setting the constant takes priority over the Vercel fallback for production,
 * because once a real domain exists it is the answer.
 */
function resolveOrigin(): string | null {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return withProtocol(explicit);

  if (!isPlaceholderUrl) return withProtocol(SITE_URL);

  if (process.env.VERCEL_ENV === 'production') {
    const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
    if (vercel) return withProtocol(vercel);
  }

  return null;
}

/** Vercel supplies a bare hostname; an explicit value may already have a scheme. */
function withProtocol(value: string): string {
  const trimmed = value.replace(/\/$/, '');
  return /^https?:\/\//.test(trimmed) ? trimmed : `https://${trimmed}`;
}

/** The resolved origin, or null when nothing credible is available. */
export const resolvedOrigin = resolveOrigin();

/**
 * Preview and branch deployments must not be indexed: they would compete with
 * the real site for the same content. Anything that is not a Vercel preview is
 * treated as indexable.
 */
export const isIndexable =
  !process.env.VERCEL_ENV || process.env.VERCEL_ENV === 'production';

/**
 * Base used only to resolve relative metadata URLs. Next needs a parseable
 * origin, and the placeholder is not one.
 */
export const metadataBaseUrl = resolvedOrigin ?? 'http://localhost:3000';

/**
 * Absolute URL helper. Every consumer goes through this rather than
 * concatenating an origin by hand.
 *
 * Returns null when no origin is known, so callers omit a canonical or Open
 * Graph URL entirely rather than publishing a wrong one. A missing canonical is
 * recoverable; one pointing somewhere false is not.
 */
export function absoluteUrl(path = '/'): string | null {
  if (!resolvedOrigin) return null;
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return `${resolvedOrigin}${suffix}`;
}

export const site: SiteConfig = {
  name: 'Aariz Khan',
  role: 'AI / ML Developer',
  discipline: 'B.Tech — Artificial Intelligence & Machine Learning',
  lead: 'I build intelligent systems that turn information into useful answers.',
  headline:
    'I build retrieval and NLP systems in Python and TypeScript — from document ' +
    'ingestion and embeddings through to evaluation.',
  email: 'pathanaarizkhan021@gmail.com',
  links: {
    github: 'https://github.com/Aariz-a-z',
    linkedin: 'https://linkedin.com/in/aariz-khan-pathan',
  },
  resume: {
    view: '/resume',
    download: '/resume/aariz-khan-resume.pdf',
  },
};

/**
 * Section anchors, shared by the navigation and the page so the two cannot
 * disagree about what exists.
 */
export const sections = [
  { id: 'work', label: 'Work' },
  { id: 'skills', label: 'Skills' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
] as const;
