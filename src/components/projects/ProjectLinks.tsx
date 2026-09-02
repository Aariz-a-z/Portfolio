import { ButtonLink } from '@/components/ui/Button';
import type { ProjectLinks as Links } from '@/types/content';

/**
 * A demo control exists only when a demo URL exists.
 *
 * There is deliberately no fallback branch and no placeholder href, so no code
 * path here can produce a dead "Live demo" button.
 */
export function ProjectLinks({
  links,
  title,
  variant = 'secondary',
}: {
  links: Links;
  /** Used to disambiguate repeated link text for screen readers. */
  title: string;
  variant?: 'primary' | 'secondary';
}) {
  if (!links.github && !links.demo) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {/*
        Each accessible name begins with the visible text. WCAG 2.5.3 (Label in
        Name) requires the visible label to be contained in the accessible name,
        so that someone using speech input can say what they can read. Phrasing
        it as "View the … source on GitHub" broke that: the words "View source"
        never appear together in it.
      */}
      {links.github && (
        <ButtonLink
          href={links.github}
          external
          variant={variant}
          icon="github"
          iconPosition="start"
          aria-label={`View source of ${title} on GitHub`}
        >
          View source
        </ButtonLink>
      )}
      {links.demo && (
        <ButtonLink
          href={links.demo}
          external
          variant="secondary"
          icon="arrow-up-right"
          aria-label={`Live Demo of ${title}`}
        >
          Live Demo
        </ButtonLink>
      )}
    </div>
  );
}
