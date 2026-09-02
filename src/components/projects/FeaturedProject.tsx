import type { Project } from '@/types/content';

import { EvaluationLine } from './EvaluationLine';
import { MediaFrame } from './MediaFrame';
import { ProjectDetail } from './ProjectDetail';
import { ProjectLinks } from './ProjectLinks';
import { StackList } from './StackList';
import { StatusNote } from './StatusBadge';

/**
 * The flagship treatment: an editorial spread, not a card.
 *
 * V2 gave this the same grammar as everything below it — bordered box, image
 * left, text right, chip row, bullet list. The most important thing on the site
 * was visually interchangeable with the second most important thing. Here the
 * title runs at display size in the serif, the media runs wide and unboxed, and
 * the verified figures are set as large mono numerals on a rule. Nothing is
 * enclosed.
 *
 * Sides alternate between the two flagships so the pair reads as a considered
 * layout rather than a repeated block. Below 1024px it stacks and the media
 * moves *after* the text, because on a phone the words earn the scroll.
 */
export function FeaturedProject({
  project,
  index,
  priority = false,
}: {
  project: Project;
  index: number;
  priority?: boolean;
}) {
  const mediaFirst = index % 2 === 0;
  const headingId = `project-${project.slug}`;

  return (
    <article aria-labelledby={headingId} className="flex flex-col gap-8 lg:gap-12">
      {/* Title band — full width, above the split, so it reads as a spread. */}
      <header className="flex flex-col gap-4">
        {/*
          Status as a word in the accent above the title, not a pill beside it.
          A badge is chrome; the word is the information, and putting it on its
          own line stops it floating in the title's ragged edge.
        */}
        {project.status === 'completed' ? (
          <span className="t-mono uppercase text-accent">Completed</span>
        ) : null}
        <h3 id={headingId} className="t-h1 max-w-[24ch] text-text">
          {project.title}
        </h3>
        <p className="t-body-lg max-w-[62ch] text-text-secondary">
          {project.summary}
        </p>
        <StatusNote note={project.statusNote} />
      </header>

      {/* Verified figures. Large mono numerals on a rule — the most scannable
          proof on the page, and every one traceable to the repository. */}
      {project.facts && project.facts.length > 0 ? (
        <dl className="grid grid-cols-2 gap-x-6 gap-y-6 border-t border-border pt-6 sm:grid-cols-4">
          {project.facts.map((fact) => (
            /*
              dt then dd, in that order, and nothing else inside the group: a
              <dl> may only contain properly ordered dt/dd pairs, optionally
              wrapped in a div. The first cut put a <p> in beside them for the
              caption, which axe flags as `definition-list`. The caption IS the
              term, so it is the <dt> — and column-reverse sets the figure above
              it without disturbing source order.
            */
            <div key={fact.label} className="flex flex-col-reverse gap-1.5">
              <dt className="t-mono uppercase text-text-muted">{fact.label}</dt>
              <dd className="t-figure text-text">{fact.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-12">
        <div
          className={`order-2 lg:order-none lg:col-span-7 ${
            mediaFirst ? '' : 'lg:col-start-6'
          }`}
        >
          <MediaFrame
            media={project.media}
            label={project.title}
            priority={priority}
          />
        </div>

        <div
          className={`order-1 flex flex-col gap-6 lg:order-none lg:col-span-5 lg:row-start-1 ${
            mediaFirst ? 'lg:col-start-8' : 'lg:col-start-1'
          }`}
        >
          <EvaluationLine evaluation={project.evaluation} />

          <StackList stack={project.stack} label="Stack" />

          {project.features.length > 0 && (
            <div>
              <h4 className="t-mono mb-3 uppercase text-text-muted">Features</h4>
              {/*
                Ruled rows rather than disc bullets. A list of capabilities is a
                specification, and a specification reads better as a table than
                as prose with dots.
              */}
              <ul className="flex flex-col">
                {project.features.map((feature) => (
                  <li
                    key={feature}
                    className="t-small border-t border-border py-2 text-text-secondary"
                  >
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <ProjectDetail project={project} />

          <ProjectLinks
            links={project.links}
            title={project.title}
            variant="primary"
          />
        </div>
      </div>
    </article>
  );
}
