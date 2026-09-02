import type { Metadata } from 'next';
import { Instrument_Serif, Inter, JetBrains_Mono } from 'next/font/google';
import type { ReactNode } from 'react';

import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SkipLink } from '@/components/layout/SkipLink';
import { education } from '@/data/education';
import { absoluteUrl, isIndexable, metadataBaseUrl, site } from '@/data/site';

import './globals.css';

/**
 * Self-hosted at build time by next/font: subset to latin, with an
 * automatically size-adjusted fallback so a swap costs no layout shift. No
 * request leaves the page for a font.
 *
 * `display: swap`, not `optional`.
 *
 * `optional` was tried, on the reasoning that it would stop the LCP paragraph's
 * paint being chained behind a font download. Measured over five runs it moved
 * the median not at all, and it carries a real cost: a visitor on a slow
 * connection would read the fallback rather than Inter for their whole visit.
 * An unproven gain is not worth that, so it was reverted.
 */
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

/**
 * Not preloaded, deliberately. Mono is used only for small labels — chips,
 * the evaluation line, the status badge — while Inter renders the heading and
 * the paragraph that is the largest contentful paint. Preloading both made the
 * two fonts compete for the critical path; letting mono arrive late costs a
 * brief fallback on a few small labels and nothing else.
 */
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  weight: ['500'],
  variable: '--font-jetbrains-mono',
  preload: false,
});

/**
 * The display face. Sets the hero name, the section headings and the flagship
 * title — about six strings on the entire site.
 *
 * NOT preloaded, and that is measured rather than assumed. It was preloaded at
 * first, on the reasoning that a late swap on 104px type is the most visible
 * reflow the page could have. But the largest contentful paint is the hero's
 * supporting paragraph, which is set in Inter — so preloading the serif put
 * fifteen kilobytes on the critical path that the LCP element gains nothing
 * from, and which competed with the font it actually needs.
 *
 * The cost of not preloading it is one swap on the name. next/font generates a
 * size-adjusted fallback, so that swap moves nothing: CLS stays at 0.000.
 */
const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400'],
  variable: '--font-display',
  preload: false,
});

const title = `${site.name} — AI/ML Engineer`;
const description =
  'AI and machine learning student building retrieval and NLP systems: ' +
  'document ingestion, embeddings, vector search and model evaluation in ' +
  'Python and TypeScript.';

const canonical = absoluteUrl('/');

export const metadata: Metadata = {
  metadataBase: new URL(metadataBaseUrl),
  title: { default: title, template: `%s — ${site.name}` },
  description,
  authors: [{ name: site.name }],
  creator: site.name,
  // Canonical is omitted while the domain is a placeholder: no canonical is
  // recoverable, a wrong one is not.
  ...(canonical ? { alternates: { canonical } } : {}),
  openGraph: {
    type: 'profile',
    title,
    description,
    siteName: site.name,
    ...(canonical ? { url: canonical } : {}),
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
  // A preview deployment serves the same content as production; letting it be
  // indexed would put the site in competition with itself.
  robots: { index: isIndexable, follow: isIndexable },
};

/**
 * JSON-LD, built from verified facts only.
 *
 * No job title, no employer, no credential and no award appears here, because
 * none is verified. `url` is present only once a real domain exists.
 */
function personSchema() {
  const [school] = education;
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: site.name,
    description,
    email: `mailto:${site.email}`,
    ...(canonical ? { url: canonical } : {}),
    sameAs: [site.links.github, site.links.linkedin],
    alumniOf: {
      '@type': 'CollegeOrUniversity',
      name: school.institution,
      address: {
        '@type': 'PostalAddress',
        addressLocality: school.location,
        addressCountry: 'IN',
      },
    },
  };
}

/**
 * Applies a stored theme choice before first paint.
 *
 * Without this the page renders in the system theme and then snaps to the
 * stored one after hydration. Wrapped in try/catch because localStorage throws
 * outright in some privacy configurations rather than returning null.
 */
const themeScript = `
try {
  var t = localStorage.getItem('theme');
  if (t === 'light' || t === 'dark') document.documentElement.setAttribute('data-theme', t);
} catch (e) {}
`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {/*
          Sections ship in their pending state so the entrance cannot flash.
          Without JavaScript nothing would ever move them out of it, so this
          reveals every section for readers who have it disabled.
        */}
        <noscript>
          <style>{`.enter[data-animate='pending']{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema()) }}
        />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} ${instrumentSerif.variable} antialiased`}
      >
        <SkipLink />
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
