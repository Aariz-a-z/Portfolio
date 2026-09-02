import { Icon } from '@/components/ui/Icon';

/**
 * What AARIZ AI does, shown rather than described.
 *
 * NOT A SCREENSHOT, AND DELIBERATELY NOT DRESSED AS ONE
 * -----------------------------------------------------
 * This is the site's own type and tokens — no browser chrome, no window bar, no
 * cursor. That is a truth decision, not a stylistic one.
 *
 * A genuine capture of this exact exchange is not available: the deployed demo
 * runs on an empty corpus and anonymous upload is disabled, so a real session
 * today returns the grounded refusal rather than an answer. Presenting an
 * invented transcript inside a window frame would claim a session that never
 * happened. Rendering the same three stages in the site's own voice claims only
 * what is true — this is the shape of what the system does — and the button
 * underneath sends the reader to the running application to see it for
 * themselves.
 *
 * The three stages are the real ones: a question goes in, passages are
 * retrieved and cited, and the answer is generated from those passages only.
 * TRUTH-LEDGER.md section 10.2 maps each to the file that implements it.
 */

const SOURCES = ['Resume.pdf', 'Projects.pdf', 'Experience.pdf'];

export function AarizAiPanel({ demo }: { demo?: string }) {
  return (
    <figure className="flex flex-col gap-4">
      <div className="flex flex-col gap-6 rounded-xl border border-border bg-surface p-6 sm:p-7">
        <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
          <span className="t-mono uppercase text-text">Aariz AI</span>
          <span className="t-mono uppercase text-accent">Completed</span>
        </div>

        {/* 1 — the question */}
        <div className="flex flex-col gap-2">
          <span className="t-mono uppercase text-text-muted">User question</span>
          <p className="t-body text-text">
            What retrieval techniques has Aariz implemented?
          </p>
        </div>

        {/* 2 — what retrieval returned, with its sources */}
        <div className="flex flex-col gap-2">
          <span className="t-mono uppercase text-text-muted">
            Retrieved sources
          </span>
          <ul className="flex flex-col gap-1.5">
            {SOURCES.map((source) => (
              <li key={source} className="flex items-baseline gap-2.5">
                <span
                  aria-hidden="true"
                  className="mt-[0.45em] size-1.5 shrink-0 rounded-full bg-accent"
                />
                <span className="t-small text-text-secondary">{source}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 3 — the answer, generated from those passages only */}
        <div className="flex flex-col gap-2 border-t border-border pt-5">
          <span className="t-mono uppercase text-text-muted">Grounded answer</span>
          <p className="t-body text-text">
            Hybrid retrieval — vector and lexical search fused by reciprocal rank
            fusion — with reranking as a separate second pass, and every answer
            generated only from the passages it cites.
          </p>
        </div>

        {demo ? (
          <a
            href={demo}
            target="_blank"
            rel="noopener noreferrer"
            className="t-mono inline-flex min-h-[44px] w-fit items-center gap-2 uppercase text-accent transition-opacity duration-150 hover:opacity-80"
          >
            Aariz AI — live demo
            <Icon name="arrow-up-right" size={14} />
          </a>
        ) : null}
      </div>

      <figcaption className="t-small text-text-muted">
        How AARIZ AI answers — a question, the passages retrieved for it, and an
        answer grounded in those passages. Try it on your own documents.
      </figcaption>
    </figure>
  );
}
