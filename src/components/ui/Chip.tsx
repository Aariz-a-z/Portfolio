import type { ReactNode } from 'react';

/**
 * A static label, not a control.
 *
 * Chips carry stack entries and skill names. They are never interactive, so
 * their border is decorative separation rather than a component boundary and
 * uses the quiet border token.
 */
export function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="t-micro inline-flex items-center rounded border border-border bg-surface-raised px-2 py-1 text-text-muted">
      {children}
    </span>
  );
}
