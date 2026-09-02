import { ImageResponse } from 'next/og';

import { site } from '@/data/site';

export const alt = `${site.name} — AI/ML engineer portfolio`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * Generated at build time by next/og, so the social card is a real image rather
 * than a screenshot that goes stale, and costs no dependency.
 *
 * Deliberately typographic: no logo, no photo, no decoration that would need
 * maintaining. Colours are the dark theme tokens, hard-coded here because this
 * renders outside the document and cannot read CSS variables.
 */
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#0B0C0E',
          padding: '72px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div
            style={{
              fontSize: 24,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#868B94',
            }}
          >
            {site.discipline}
          </div>
          <div style={{ fontSize: 92, fontWeight: 700, color: '#E9EAEC' }}>
            {site.name}
          </div>
          <div
            style={{
              fontSize: 32,
              lineHeight: 1.4,
              color: '#A2A7B0',
              maxWidth: '900px',
            }}
          >
            {site.headline}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '3px', background: '#8AB4F8' }} />
          <div style={{ fontSize: 26, color: '#868B94' }}>
            github.com/Aariz-a-z
          </div>
        </div>
      </div>
    ),
    size,
  );
}
