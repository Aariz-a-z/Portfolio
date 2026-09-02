/**
 * The RAG chatbot's pipeline, told twice.
 *
 * V2 drew this as a flowchart: fourteen rounded boxes, arrowheads, a dashed
 * annotation panel, on a grey card. It was accurate and it looked like a tool
 * export. A recruiter reading it learned nothing in the four seconds they had,
 * and an engineer could not check any of it.
 *
 * So it is two layers now.
 *
 * LAYER 1 — the story, always visible. Five terms on one rule. That is what a
 * retrieval system does, in language anybody can follow, readable at a glance.
 *
 * LAYER 2 — the engineering, on demand. The ten verified stages with the file
 * that implements each, behind a disclosure. An interviewer opens it; a
 * recruiter never has to.
 *
 * Drawn rather than screenshotted because no honest screenshot exists: the
 * application runs, but its corpus is empty, and filling it would mean writing
 * documents into a live database to make a picture.
 *
 * Every row in layer 2 maps to a file in `Aariz-a-z/aariz-ai`, verified against
 * the repository on 2026-09-01 and recorded in TRUTH-LEDGER.md section 10.2.
 */

const STORY = [
  { term: 'Document', note: 'Ten formats in, one shape out' },
  { term: 'Fragments', note: '600–900 tokens, overlapping' },
  { term: 'Retrieval', note: 'Vector and keyword, fused' },
  { term: 'Context', note: 'The best few, reordered' },
  { term: 'Answer', note: 'Grounded, and cited' },
];

const STAGES: { stage: string; detail: string; file: string }[] = [
  {
    stage: 'Ingestion',
    detail: 'Upload or CLI, parsed from memory',
    file: 'lib/ingest/pipeline.ts',
  },
  {
    stage: 'Extraction',
    detail: 'unpdf, node-html-parser, OLE2 reader',
    file: 'lib/ingest/extract.ts',
  },
  {
    stage: 'OCR',
    detail: 'Scanned PDFs — hosted provider only',
    file: 'lib/ingest/ocr.ts',
  },
  {
    stage: 'Chunking',
    detail: '600–900 tokens, 100 overlap',
    file: 'lib/ingest/chunking.ts',
  },
  {
    stage: 'Embeddings',
    detail: '768 dimensions, local or hosted',
    file: 'lib/embeddings.ts',
  },
  {
    stage: 'Vector storage',
    detail: 'vector(768), HNSW cosine index',
    file: 'migrations/…init.sql',
  },
  {
    stage: 'Semantic search',
    detail: '1 - (embedding <=> query)',
    file: 'migrations/…match_chunks.sql',
  },
  {
    stage: 'Hybrid search',
    detail: 'ts_rank_cd fused by RRF, k = 60',
    file: 'migrations/…hybrid_search.sql',
  },
  {
    stage: 'Reranking',
    detail: 'Over-fetched candidates, fail-open',
    file: 'lib/rerank.ts',
  },
  {
    stage: 'Grounded answer',
    detail: '<document> blocks, cited sources',
    file: 'lib/rag.ts',
  },
];

export function PipelineDiagram() {
  return (
    <div className="flex flex-col gap-8">
      {/* Layer 1 — the story. */}
      <ol className="grid grid-cols-2 gap-x-5 gap-y-7 sm:grid-cols-3 lg:grid-cols-5">
        {STORY.map((step, i) => (
          <li key={step.term} className="flex flex-col gap-2">
            {/*
              A rule per step with an accent tick at its start, and the ticks
              line up across the row — which is what makes five separate items
              read as one sequence without drawing a single arrow.
            */}
            <span className="relative block border-t border-border pt-3">
              <span
                aria-hidden="true"
                className="absolute left-0 top-[-1px] h-px w-5 bg-accent"
              />
              <span className="t-mono text-text-muted">
                {String(i + 1).padStart(2, '0')}
              </span>
            </span>
            <span className="t-h3 text-text">{step.term}</span>
            <span className="t-small text-text-muted">{step.note}</span>
          </li>
        ))}
      </ol>

      {/* Layer 2 — the engineering. */}
      <details className="group border-t border-border pt-4">
        <summary className="t-mono flex min-h-[44px] cursor-pointer list-none items-center gap-2 uppercase text-text-secondary transition-colors duration-150 hover:text-text">
          <span
            aria-hidden="true"
            className="inline-block transition-transform duration-200 group-open:rotate-90"
          >
            →
          </span>
          How each stage is implemented
        </summary>

        <ul className="mt-4 flex flex-col">
          {STAGES.map((row) => (
            <li
              key={row.stage}
              className="grid grid-cols-1 gap-x-6 gap-y-1 border-t border-border py-3 sm:grid-cols-12"
            >
              <span className="t-small text-text sm:col-span-3">{row.stage}</span>
              <span className="t-small text-text-secondary sm:col-span-5">
                {row.detail}
              </span>
              <code className="t-mono text-text-muted sm:col-span-4">
                {row.file}
              </code>
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
