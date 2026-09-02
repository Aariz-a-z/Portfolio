import type { Project } from '@/types/content';

import { ProjectLinks } from './ProjectLinks';

/**
 * Compact treatment: a dense bordered list, one row per program.
 *
 * These are fundamentals exercises. Giving them cards the size of the machine
 * learning work would misrepresent their weight, so they get one line each and a
 * single shared repository link.
 */
export function CompactProjectList({ project }: { project: Project }) {
  const headingId = `project-${project.slug}`;

  return (
    <article aria-labelledby={headingId} className="rule-accent pt-6">
      <div className="flex flex-col gap-2">
        <h3 id={headingId} className="t-h2 text-text">
          {project.title}
        </h3>
        <p className="t-body measure text-text-secondary">{project.summary}</p>
      </div>

      <ul className="my-5 divide-y divide-border border-y border-border">
        {project.features.map((feature) => {
          const [name, ...rest] = feature.split(' — ');
          const description = rest.join(' — ');
          return (
            <li
              key={feature}
              className="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-baseline sm:gap-4"
            >
              <span className="t-small font-medium text-text sm:w-56 sm:shrink-0">
                {name}
              </span>
              {description && (
                <span className="t-small text-text-secondary">{description}</span>
              )}
            </li>
          );
        })}
      </ul>

      <ProjectLinks links={project.links} title={project.title} />
    </article>
  );
}
