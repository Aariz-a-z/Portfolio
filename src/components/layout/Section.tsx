import type { ReactNode } from 'react';

import { Container } from './Container';

interface SectionProps {
  id: string;
  /** Rendered as the section's h2. Every section has exactly one. */
  title: string;
  /** Optional line under the heading. */
  intro?: string;
  /** Two-digit index shown in mono beside the heading, e.g. "01". */
  index?: string;
  children: ReactNode;
  /** Set for the section that closes the page, to avoid a doubled border. */
  last?: boolean;
}

/**
 * A landmark, a heading, and the spacing rhythm — in one place so no section can
 * drift from the others.
 *
 * `aria-labelledby` ties the region to its own heading, which is what gives the
 * section a useful name in a screen reader's landmark list.
 */
export function Section({
  id,
  title,
  intro,
  index,
  children,
  last = false,
}: SectionProps) {
  const headingId = `${id}-heading`;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={`py-20 sm:py-32 ${last ? '' : 'border-b border-border'}`}
    >
      <Container>
        <div className="enter" data-animate="pending">
          {/*
            An accent-tipped hairline above every heading. This is the device
            that separates sections in V3 — the bordered card is gone, so rhythm
            and rules do the work boxes used to do.
          */}
          <div className="rule-accent mb-10 pt-6 sm:mb-16">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="flex flex-col gap-3">
                {index ? (
                  <span aria-hidden="true" className="t-mono text-accent">
                    {index}
                  </span>
                ) : null}
                <h2 id={headingId} className="t-section text-text">
                  {title}
                </h2>
              </div>
              {intro && (
                <p className="t-body max-w-[42ch] text-text-secondary md:text-right">
                  {intro}
                </p>
              )}
            </div>
          </div>
          {children}
        </div>
      </Container>
    </section>
  );
}
