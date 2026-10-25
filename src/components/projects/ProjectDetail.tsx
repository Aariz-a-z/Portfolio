import { Icon } from '@/components/ui/Icon';
import type { Project } from '@/types/content';

/**
 * Progressive disclosure built on `<details>`, so the technical depth is
 * present in the DOM for search engines and fully operable with no JavaScript
 * at all.
 *
 * `open` starts it expanded. The flagships use it: on a project that is the
 * reason someone is reading the page, the problem, approach and implementation
 * are the content rather than an optional extra, and making a reader hunt for
 * them loses the only audience that wants them. It stays a `<details>` either
 * way, so it can still be collapsed.
 */
export function ProjectDetail({
  project,
  open = false,
}: {
  project: Project;
  open?: boolean;
}) {
  const hasDetail =
    project.problem || project.approach || project.implementation.length > 0;

  if (!hasDetail) return null;

  return (
    <details open={open} className="group border-t border-border pt-4">
      <summary className="t-small flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-2 font-medium text-text">
        <span>Technical detail</span>
        <Icon
          name="chevron-down"
          size={18}
          className="text-text-muted transition-transform duration-200 ease-[cubic-bezier(0.2,0,0,1)] group-open:rotate-180"
        />
      </summary>

      <div className="mt-4 flex flex-col gap-5">
        {project.problem && (
          <div>
            <h4 className="t-mono mb-2 uppercase text-text-muted">Problem</h4>
            <p className="t-body measure text-text-secondary">{project.problem}</p>
          </div>
        )}

        {project.approach && (
          <div>
            <h4 className="t-mono mb-2 uppercase text-text-muted">Approach</h4>
            <p className="t-body measure text-text-secondary">{project.approach}</p>
          </div>
        )}

        {project.implementation.length > 0 && (
          <div>
            <h4 className="t-mono mb-2 uppercase text-text-muted">
              Implementation
            </h4>
            <ul className="flex list-disc flex-col gap-2 pl-4 marker:text-text-muted">
              {project.implementation.map((item) => (
                <li key={item} className="t-small measure text-text-secondary">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </details>
  );
}
