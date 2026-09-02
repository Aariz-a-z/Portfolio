import type { Project } from '@/types/content';

import { EvaluationLine } from './EvaluationLine';
import { ProjectDetail } from './ProjectDetail';
import { ProjectLinks } from './ProjectLinks';
import { StackList } from './StackList';
import { StatusBadge, StatusNote } from './StatusBadge';

/**
 * Standard treatment: a ruled row, not a card.
 *
 * V2 rendered these as a grid of bordered boxes, which gave six ordinary
 * projects the same visual weight as each other and very nearly the same weight
 * as the flagship. A row with a hairline above it and a numbered index reads as
 * an ordered body of work instead of a set of tiles, and it lets the eye run
 * down the titles without stopping at six outlines.
 *
 * Stack, evaluation and links stay visible without interaction — the brief is
 * explicit that these must not hide behind a click. Only the longer
 * problem/approach/implementation prose sits behind the disclosure.
 */
export function ProjectCard({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  const headingId = `project-${project.slug}`;

  return (
    <article
      aria-labelledby={headingId}
      className="group grid grid-cols-1 gap-x-10 gap-y-5 border-t border-border py-8 transition-colors duration-200 hover:border-border-strong lg:grid-cols-12 lg:py-10"
    >
      <div className="flex items-baseline gap-4 lg:col-span-4">
        <span
          aria-hidden="true"
          className="t-mono text-text-muted transition-colors duration-200 group-hover:text-accent"
        >
          {String(index + 1).padStart(2, '0')}
        </span>
        <div className="flex flex-col gap-2">
          <h3 id={headingId} className="t-h3 text-text">
            {project.title}
          </h3>
          <StatusBadge status={project.status} />
        </div>
      </div>

      <div className="flex flex-col gap-5 lg:col-span-5">
        <p className="t-body text-text-secondary">{project.summary}</p>
        <StatusNote note={project.statusNote} />
        <EvaluationLine evaluation={project.evaluation} />
        <StackList stack={project.stack} label="Stack" />
      </div>

      <div className="flex flex-col gap-4 lg:col-span-3">
        <ProjectDetail project={project} />
        <ProjectLinks links={project.links} title={project.title} />
      </div>
    </article>
  );
}
