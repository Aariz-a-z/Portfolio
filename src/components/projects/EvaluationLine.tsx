import type { Evaluation } from '@/types/content';

/**
 * The only place a metric is rendered.
 *
 * Because every metric goes through here, precision cannot drift between cards
 * and there is nowhere for a number to acquire business framing on its way to
 * the page — this component accepts a metric name, a pre-formatted value and an
 * optional evaluation basis, and can express nothing else.
 */
export function EvaluationLine({ evaluation }: { evaluation?: Evaluation }) {
  if (!evaluation) return null;

  return (
    <p className="t-small text-text-secondary">
      <span className="t-micro uppercase text-text-muted">Evaluation</span>{' '}
      <span aria-hidden="true" className="text-text-muted">
        —
      </span>{' '}
      <span className="font-mono text-text">
        {evaluation.metric}: {evaluation.value}
      </span>
      {evaluation.basis && (
        <span className="text-text-muted"> ({evaluation.basis})</span>
      )}
    </p>
  );
}
