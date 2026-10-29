import { projects } from '@/data/projects';
import type { ProjectTier } from '@/types/content';

import { CompactProjectList } from './CompactProjectList';
import { FeaturedProject } from './FeaturedProject';
import { ProjectCard } from './ProjectCard';

/**
 * The single dispatch point between data and layout.
 *
 * Everything on the page is selected from `projects.ts` by tier and handed to
 * the matching tier component. No project title, summary, stack entry, metric or
 * URL appears in any component file, which is what makes adding a ninth project
 * a one-object data change.
 */
export function ProjectsSection({ tier }: { tier: ProjectTier }) {
  const selected = projects.filter((project) => project.tier === tier);

  if (selected.length === 0) return null;

  if (tier === 'flagship') {
    return (
      <div className="flex flex-col gap-20 sm:gap-32">
        {selected.map((project, index) => (
          <FeaturedProject
            key={project.slug}
            project={project}
            index={index}
            priority={index === 0}
          />
        ))}
      </div>
    );
  }

  if (tier === 'compact') {
    return (
      <div className="flex flex-col gap-12 sm:gap-16">
        {selected.map((project) => (
          <CompactProjectList key={project.slug} project={project} />
        ))}
      </div>
    );
  }

  // Ruled rows rather than a grid of tiles. The closing border gives the last
  // row a bottom edge without wrapping the set in a box.
  return (
    <div className="stagger flex flex-col border-b border-border">
      {selected.map((project, index) => (
        <ProjectCard key={project.slug} project={project} index={index} />
      ))}
    </div>
  );
}
