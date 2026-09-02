'use client';

import { useRevealAll } from '@/lib/motion';

/**
 * Mounts the single entrance observer for the whole page.
 *
 * Renders nothing. It exists so that one client boundary covers every section,
 * rather than each section carrying its own.
 */
export function RevealAll() {
  useRevealAll();
  return null;
}
