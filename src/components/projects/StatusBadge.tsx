import type { Project } from '@/types/content';

/**
 * Renders for ongoing projects only.
 *
 * A completed project returns null rather than a "Completed" badge, so the badge
 * carries information by its presence instead of decorating every card.
 */
export function StatusBadge({ status }: { status: Project['status'] }) {
  if (status !== 'ongoing') return null;

  return (
    <span className="t-micro inline-flex w-fit items-center gap-1.5 rounded border border-border bg-surface-raised px-2 py-1 uppercase text-status-ongoing">
      <span aria-hidden="true" className="size-1.5 rounded-full bg-status-ongoing" />
      In progress
    </span>
  );
}

/**
 * The note explaining what is currently in progress.
 *
 * Separate from the badge because of reading order: the note is a sentence about
 * a project, and a reader who meets it above the project's title has to hold it
 * in mind until they learn what it refers to. The badge is a one-word label and
 * works as an eyebrow; the sentence belongs after the summary.
 */
export function StatusNote({ note }: { note?: string }) {
  if (!note) return null;
  return <p className="t-small text-text-secondary">{note}</p>;
}
