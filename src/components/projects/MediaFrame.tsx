import Image from 'next/image';
import type { ReactNode } from 'react';

import type { ProjectMedia } from '@/types/content';

import { PipelineDiagram } from './PipelineDiagram';

/**
 * Drawn diagrams a project can point at by name.
 *
 * A lookup table rather than a conditional on the project's slug: this file
 * still contains no project copy, and `projects.ts` remains the only place that
 * decides which project shows what.
 */
const DIAGRAMS: Record<string, ReactNode> = {
  'rag-pipeline': <PipelineDiagram />,
};

/**
 * A screenshot, a drawn diagram, or an honest statement that there is neither.
 *
 * The fallback is deliberately not a generic image placeholder: an empty grey
 * rectangle with a picture glyph implies a screenshot that failed to load. This
 * says in words that no capture exists yet, at the aspect ratio a capture would
 * occupy, so the layout is already correct when one arrives.
 */
export function MediaFrame({
  media,
  label,
  priority = false,
}: {
  media?: ProjectMedia;
  /** Names what would be shown, e.g. 'Retrieval pipeline'. */
  label: string;
  priority?: boolean;
}) {
  if (media?.kind === 'diagram') {
    const diagram = DIAGRAMS[media.src];
    if (diagram) {
      // No frame, no panel, no fixed aspect ratio. A diagram built from the
      // page's own type and rules is part of the page; boxing it re-creates the
      // card the V3 layout exists to remove, and a locked aspect ratio forces a
      // typographic diagram to either overflow or leave dead space.
      return <div className="w-full">{diagram}</div>;
    }
  }

  if (media) {
    return (
      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <Image
          src={media.src}
          alt={media.alt}
          width={media.width}
          height={media.height}
          priority={priority}
          loading={priority ? undefined : 'lazy'}
          sizes="(min-width: 1024px) 560px, 100vw"
          className="h-auto w-full"
        />
      </div>
    );
  }

  return (
    <div
      className="flex aspect-[16/10] items-end rounded-xl border border-dashed border-border bg-surface p-5"
      role="img"
      aria-label={`No screenshot captured yet for ${label}`}
    >
      <p className="t-micro uppercase text-text-muted">
        {label}
        <span aria-hidden="true"> · screenshot not yet captured</span>
      </p>
    </div>
  );
}
