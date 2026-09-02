import { Chip } from '@/components/ui/Chip';

/**
 * An empty stack renders nothing at all — no heading, no empty row.
 *
 * That is what keeps an unconfirmed technology list off the page without
 * leaving a visible gap where it would have been.
 */
export function StackList({ stack, label }: { stack: string[]; label: string }) {
  if (stack.length === 0) return null;

  return (
    <div>
      <h4 className="t-micro mb-2 uppercase text-text-muted">{label}</h4>
      <ul className="flex flex-wrap gap-1.5">
        {stack.map((item) => (
          <li key={item}>
            <Chip>{item}</Chip>
          </li>
        ))}
      </ul>
    </div>
  );
}
