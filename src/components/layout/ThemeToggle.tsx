'use client';

import { Icon } from '@/components/ui/Icon';

/**
 * Explicit theme choice, remembered per reader.
 *
 * Holds no React state. The document element is already the source of truth —
 * it carries `data-theme` once a choice exists, and follows the system
 * preference through CSS when it does not — so mirroring that into state would
 * mean reading it in an effect, rendering the wrong icon for one frame, and
 * re-rendering to correct it.
 *
 * Both icons are therefore rendered and CSS shows whichever matches the active
 * theme, which stays correct through server rendering, hydration and a system
 * preference that changes while the page is open. The label is direction-neutral
 * for the same reason: it cannot be made to depend on CSS state, and a label
 * that names the wrong direction is worse than one that names none.
 */
export function ThemeToggle() {
  function toggle() {
    const root = document.documentElement;
    const explicit = root.getAttribute('data-theme');
    const current =
      explicit ??
      (window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light');
    const next = current === 'dark' ? 'light' : 'dark';

    root.setAttribute('data-theme', next);
    try {
      window.localStorage.setItem('theme', next);
    } catch {
      /* Storage unavailable: the choice applies but does not persist. */
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Switch colour theme"
      title="Switch colour theme"
      className="inline-flex size-11 items-center justify-center rounded-lg text-text-secondary transition-colors duration-150 hover:bg-surface-raised hover:text-text"
    >
      <Icon name="moon" className="theme-icon-moon" />
      <Icon name="sun" className="theme-icon-sun" />
    </button>
  );
}
