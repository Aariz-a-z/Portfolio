import { education } from '@/data/education';

/**
 * Present and accurate, and visually secondary to the projects by design —
 * quiet ruled rows rather than cards that compete with the work above them.
 *
 * An entry with no start year renders just its end year. A school leaving
 * certificate has one date, and "–2021" is not a date range.
 */
export function EducationSection() {
  return (
    <ul className="flex flex-col gap-4">
      {education.map((entry) => (
        <li
          key={entry.institution}
          className="rule-accent flex flex-col gap-2 pt-6 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
        >
          <div className="flex flex-col gap-0.5">
            <h3 className="t-h2 text-text">
              {entry.credential}, {entry.field}
            </h3>
            <p className="t-body text-text-secondary">
              {entry.institution} · {entry.location}
            </p>
          </div>
          <p className="t-mono whitespace-nowrap text-text-muted">
            {entry.start ? `${entry.start}–${entry.end}` : entry.end} ·{' '}
            {entry.score.label} {entry.score.value}
          </p>
        </li>
      ))}
    </ul>
  );
}
