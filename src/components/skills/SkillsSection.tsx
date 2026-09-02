import { skillGroups } from '@/data/skills';

/**
 * Grouped, never a badge cloud.
 *
 * A qualifier renders inline next to the skill it belongs to, so an honest
 * "Basics" travels with the claim instead of being dropped for a tidier row.
 *
 * The group heading carries the accent and an accent-tipped rule, which is the
 * same device the sections use — so Skills reads as part of the page's system
 * rather than as a stray three-column list on an empty field.
 */
export function SkillsSection() {
  return (
    <div className="grid grid-cols-1 gap-x-12 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
      {skillGroups.map((group) => (
        <section key={group.id} aria-labelledby={`skills-${group.id}`}>
          <h3
            id={`skills-${group.id}`}
            className="rule-accent t-mono pt-3 uppercase text-accent"
          >
            {group.label}
          </h3>
          <ul className="mt-4 flex flex-col gap-2">
            {group.items.map((item) => (
              <li key={item.name} className="t-body text-text-secondary">
                {item.name}
                {item.qualifier && (
                  <span className="text-text-muted"> — {item.qualifier}</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
