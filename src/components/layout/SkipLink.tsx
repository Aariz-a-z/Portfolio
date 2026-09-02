/**
 * Visually hidden until focused, then a real, visible target.
 *
 * Positioned rather than clipped so that it can move into view on focus, which a
 * `sr-only` class alone cannot do.
 */
export function SkipLink() {
  return (
    <a
      href="#main"
      className="absolute left-4 top-4 z-[100] -translate-y-[200%] rounded-lg border border-border-strong bg-surface px-4 py-2.5 text-[0.9375rem] font-medium text-text transition-transform duration-150 focus:translate-y-0"
    >
      Skip to content
    </a>
  );
}
