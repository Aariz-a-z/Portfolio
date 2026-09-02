# PLAN.md — FINAL

Date: 2026-08-27 · Revision 3 (final)
Status: **awaiting explicit approval to implement. No application code has been written.**

Incorporates the final decision set (items 1–15), which supersedes Plan Revision Round 1,
which superseded the original brief. Per item 15, the Truth Ledger is authoritative:
anywhere a decision meets contrary repository evidence, the conflict is flagged in §9 rather
than resolved silently.

**Locked:** Next.js 16 + TypeScript + Tailwind v4 · Vercel · phone off the public site ·
resume rebuilt as a text-selectable, ATS-readable PDF.

Target directory is empty (`AUDIT.md` §0), so every file is a create.

---

## 1. Decision register

Traceability for every final decision, and where it is implemented.

| # | Decision | Where it lands |
|---|---|---|
| 1 | CGPA **8.8** | `src/data/education.ts`; ledger §2 |
| 2 | **No Iris metric published** | `projects.ts` — Iris carries no `evaluation`; ledger §5.6 |
| 3 | Sales R² **0.525** | `projects.ts`; ledger §5.3, §6 |
| 4 | **SQL (Basics)** retained | `src/data/skills.ts`; ledger §7 |
| 5 | RAG = ongoing, substantial implemented functionality, verified only | §6.1; ledger §5.1 |
| 6 | RAG screenshot attempted, never faked | §8 |
| 7 | Certifications omitted | Type kept, list empty, nothing rendered |
| 8 | `SITE_URL` stays `TODO_` | §5; build warning |
| 9 | Phone not on the site | Resume PDF only |
| 10 | Resume rebuilt, nothing invented or altered | §10 — **one question open, §9.1** |
| 11 | Travel Planner described strictly as inspected | §6.3; ledger §5.7 |
| 12 | Python set = the four repo-verified programs | §6.4; ledger §5.8 |
| 13 | Internships omitted | No experience section anywhere |
| 14 | Orphan CV projects omitted | Ledger §4 records the cut |
| 15 | Ledger authoritative; conflicts flagged | §9 |

---

## 2. Information architecture

Single page at `/` with anchored sections, plus `/resume`.

| # | Section | Why it sits here |
|---|---|---|
| 1 | **Hero** | The 5-second test. Name, discipline, one grounded sentence, primary CTA above the fold. |
| 2 | **Featured work** — RAG Chatbot, AI Resume Analyzer | A claim followed immediately by its proof. A recruiter who stops here has still seen the strongest two. |
| 3 | **Projects** — Sales, Heart Stroke, Wine, Iris, Travel Planner | Breadth after depth. |
| 4 | **Python fundamentals** — compact row | Honest framing; compact treatment signals self-awareness about what these are. |
| 5 | **Skills** — grouped | After the evidence. A skill list *before* projects reads as a claim; after them it reads as a summary. |
| 6 | **About** | First person, once the reader has reason to care who wrote the code. |
| 7 | **Education** | Accurate, visually secondary to projects. |
| 8 | **Contact** | Email, LinkedIn, GitHub, resume. |

**Absent by decision:** certifications (7), experience/internships (13). Per the earlier
ruling the absence is not papered over — no "involvement", "exposure", or "coursework"
language appears anywhere to imply experience that does not exist.

`/resume` holds the download link and PDF viewer, and is linked from the header nav on every
page.

**Rejected:** per-project detail routes. They add routing surface and a second `h1` per page
to keep truthful, while the destination a recruiter actually wants is the GitHub repo.
Flagship depth uses in-page progressive disclosure that works without JavaScript.

---

## 3. Project tiers — final

| Project | Tier | Status | Metric | Repo |
|---|---|---|---|---|
| RAG Chatbot (AARIZ AI) | **flagship** | `ongoing` | none | `Aariz-a-z/aariz-ai` |
| AI Resume Analyzer | **flagship** | `completed` | none, forbidden | `Aariz-a-z/AI-RESUME-ANALYZER` |
| Sales Forecasting | standard | `completed` | `R²: 0.525` | `Aariz-a-z/Sales-forecasting` |
| Heart Stroke Prediction | standard | `completed` | `ROC-AUC: 0.839` | `Aariz-a-z/Heart-stroke-prediction` |
| Wine Quality Classification | standard | `completed` | none | `Aariz-a-z/Wine-quality-classification` |
| Iris Flower Classification | standard | `completed` | **none — decision 2** | `Aariz-a-z/Iris-flower-classification` |
| Travel Planner | standard | `completed` | none | `Aariz-a-z/project-1` |
| Python fundamentals (4) | **compact** | `completed` | none | `Aariz-a-z/python-projects` |

Exactly two metrics render across the entire site.

---

## 4. Component tree

Greenfield. Hard cap 200 lines per component.

```
app/
  layout.tsx              fonts, <html lang>, metadata from SITE_URL, JSON-LD Person,
                          skip link, header, footer
  page.tsx                composes the eight sections, renders from src/data only
  resume/page.tsx         download link first, PDF viewer below the fold
  robots.ts · sitemap.ts · opengraph-image.tsx · not-found.tsx
  globals.css             Tailwind v4 @theme tokens

components/
  layout/    SiteHeader · SiteFooter · SkipLink · Container · Section · ThemeToggle
  hero/      Hero
  projects/  ProjectsSection · FeaturedProject · ProjectCard · CompactProjectList
             ProjectDetail · StackList · StatusBadge · EvaluationLine
             ProjectLinks · MediaFrame
  skills/    SkillsSection · SkillGroup
  about/     About
  education/ EducationSection
  contact/   ContactSection
  ui/        Button · Chip · Icon

src/
  data/    projects.ts · skills.ts · education.ts · certifications.ts · site.ts
  types/   content.ts
  lib/     motion.ts
scripts/
  check-contrast.mjs · scan-secrets.mjs · build-resume.py      (tooling, never shipped)
```

**Rendering contract.** `ProjectsSection` reads `projects.ts`, groups by `tier`, dispatches
to the three tier components. Adding a ninth project is one appended object. No component
contains a project title, summary, stack string, metric, or URL.

---

## 5. Data schema

`src/types/content.ts` — the original §5 schema with three justified additions.

```ts
export type ProjectStatus = 'ongoing' | 'completed';
export type ProjectTier   = 'flagship' | 'standard' | 'compact';

export interface Evaluation {
  metric: string;   // 'ROC-AUC' | 'R²'
  value: string;    // pre-formatted, three decimals
  basis?: string;   // stated only where verified in code
}

export interface Project {
  slug: string;
  title: string;
  tier: ProjectTier;
  status: ProjectStatus;
  summary: string;
  problem: string;
  approach: string;
  implementation: string[];
  features: string[];
  stack: string[];
  links: { github?: string; demo?: string };
  media?: { src: string; alt: string; width: number; height: number };
  statusNote?: string;    // ongoing only
  evaluation?: Evaluation;
}
```

- **`evaluation`** — one typed field rendered by one component, so three-decimal precision
  cannot drift between cards and no metric can be written as free prose. Omitting the field
  is how Iris, Wine, Travel Planner and both flagships carry no number.
- **`statusNote`** — the ongoing badge's honest note, typed rather than baked into the badge.
- **`media.width` / `height`** — explicit dimensions, required to hold CLS below 0.1.

Supporting types: `SkillGroup` (with an optional `qualifier` that carries "Basics"
honestly), `Education`, and `Certification`. `src/data/certifications.ts` exports an empty
array; no component consumes it. Decision 7 satisfied — ready, empty, silent.

**Education, final:**

```
CMR University · Bengaluru
B.Tech, Artificial Intelligence & Machine Learning
2023 – 2027 · CGPA 8.8
```

### Rules the data enforces structurally

- `stack: []` renders nothing.
- `links.demo` absent means no demo button exists in any code path — there is no `#` href
  to leak.
- `status: 'ongoing'` is the only thing that emits the badge; `statusNote` supplies its text.
- Planned work lives in `approach` in future tense, never in `features`.
- Unresolved facts are the literal string `TODO: NEEDS USER CONFIRMATION`.

---

## 6. Identity and the single URL source

`src/data/site.ts`:

```ts
export const SITE_URL = 'TODO_FINAL_DOMAIN';

export const site: SiteConfig = {
  name: 'Aariz Khan',
  discipline: 'B.Tech — Artificial Intelligence & Machine Learning',
  email: 'pathanaarizkhan021@gmail.com',
  links: {
    github: 'https://github.com/Aariz-a-z',
    linkedin: 'https://linkedin.com/in/aariz-khan-pathan',
  },
};
```

`SITE_URL` is the sole origin string. Canonical, OG, Twitter card, `sitemap.ts`, `robots.ts`
and JSON-LD `url` all derive from it — replacing one string updates everything.
`next.config.ts` emits a formatted `console.warn` while it still contains `TODO_`, and does
not throw (decision 8).

No phone number appears anywhere in the site, its metadata, or its JSON-LD (decision 9).
Display name is **Aariz Khan** everywhere.

---

## 7. Project copy sourcing

Every claim maps to a row in `TRUTH-LEDGER.md`.

### 7.1 RAG Chatbot — flagship, ongoing (decision 5)

**Framing:** an ongoing project with substantial implemented functionality. Not "exploring
RAG", and not complete. The copy describes the pipeline that exists.

**Visible stack:** Next.js 16.3.1 · React 19 · TypeScript 5 · Tailwind CSS 4 · Supabase ·
PostgreSQL + pgvector · unpdf · Ollama · Gemini. Each verified at a call site.
`node-html-parser` is a real, used dependency deliberately kept off the card as a detail
below the threshold of interest; it appears in the ledger.

Described, each traced:

- **Ingestion** — `src/lib/ingest/extract.ts` converges every format on one
  `ExtractedDocument`. PDFs via `unpdf`; HTML via `node-html-parser`. Two entry points over
  one implementation: path-based for CLI ingestion, buffer-based for HTTP upload, so uploads
  are never written to disk.
- **Chunking** — `chunking.ts` splits on semantic boundaries in order (headings, paragraphs,
  sentences) at ~600–900 tokens with ~100 tokens overlap, folds orphan fragments back, and
  prepends document title and heading path so a retrieved fragment is interpretable alone.
- **Embedding** — `embeddings.ts` is a provider-agnostic facade holding batching, retry with
  backoff, validation and the dimension check, so those policies cannot drift between
  providers. Adapters do one batch call each.
- **Storage** — Supabase PostgreSQL with pgvector; `supabase/vector.ts` is an explicit
  wire-format boundary because PostgREST carries vectors as a bracketed string.
- **Retrieval** — `retrieval.ts` embeds the query, calls `match_chunks` against an HNSW
  cosine index, over-fetches so deduplication cannot under-return, and deduplicates. The 0.5
  threshold came from measurement: 0.797 for a relevant document against its query versus
  0.433 for an unrelated one.
- **Hybrid search and reranking** — vector plus full-text, fused by Reciprocal Rank Fusion,
  then reordered. Reranking is fail-open: a broken reranker returns the fused order rather
  than failing the request.
- **Generation** — `rag.ts` assembles retrieved chunks into indexed, titled context blocks
  and streams through `/api/chat`, with a context budget bounded by measured hardware limits
  and lowest-similarity chunks dropped first.
- **Provider abstraction** — the genuine engineering point, called out. Model selection is
  environment-driven across local (Ollama) and hosted (Gemini) providers for both generation
  and embeddings. `inference-mode.ts` *describes* the configuration while `llm.ts`
  *enforces* it, so a zero-API deployment makes a cloud provider unselectable rather than
  merely displaying a label.

Auth, rate limiting, conversation memory, the embeddable widget and the evaluation harness
all have code and are mentionable. None is described as production-hardened, and no eval
result is quoted.

**`statusNote`** — "Extending document ingestion to structured formats: CSV, DOCX, JSON and
XLSX." Traced to untracked `ingest/structured.ts` and `formats.ts`, modified `extract.ts`,
and untracked migration `20260827120000_structured_source_types.sql`. Provenance is an
uncommitted working tree, which is recorded in the ledger; see §9.2.

### 7.2 AI Resume Analyzer — flagship, completed

Stack: Python · Streamlit · Sentence-Transformers · PyMuPDF · Plotly — all four in
`requirements.txt`, each traced to a call site.

Copy emphasises the embedding and similarity pipeline and PDF text extraction:
`all-MiniLM-L6-v2` encodes resume and job description, cosine similarity scores the pair,
PyMuPDF extracts page text, a regex pass normalises it, a word-count check flags resumes an
ATS is likely to mis-parse, and a 7-entry alias ontology produces the skill-gap list drawn
as a Plotly radar chart. **No accuracy or match-rate number** — forbidden by the brief.

### 7.3 Travel Planner — standard (decision 11)

Described strictly as inspected: a multi-page web application with PHP-based user
authentication and a MySQL data layer. The words *responsive*, *static*, *backend-free* and
"HTML/CSS project" do not appear, because the code does not support them — zero media
queries across all eight stylesheets, and two committed PHP files opening a MySQL
connection. Neither do "full-stack platform", "secure authentication", nor any
session-handling claim, none of which was verified.

Nothing about the credential issue appears anywhere.

### 7.4 Python fundamentals — compact (decision 12)

Exactly four, all repo-verified: **Password Generator · Student Management System ·
Authentication System · Expense Tracker**. One clause each, one shared repo link, no
expansion.

### 7.5 Metrics — final

Rendered by `EvaluationLine` as `Evaluation — <metric>: <value>`, three decimals. Business
framing is impossible by construction: the component takes a metric name and a number.

| Project | Rendered | Basis (verified in code) |
|---|---|---|
| Heart Stroke Prediction | `Evaluation — ROC-AUC: 0.839` | stratified 80/20 hold-out |
| Sales Forecasting | `Evaluation — R²: 0.525` | chronological 80/20 hold-out |

**Iris publishes no metric** (decision 2). The project is kept; the card carries approach and
implementation without a number. Raw values `0.8390` and `0.5249` stay in the ledger.

No other project carries a number. No aggregate counters anywhere.

---

## 8. Design direction — concrete values

### 8.1 Typography

Two typefaces, self-hosted at build time via `next/font`, subset to `latin`,
`font-display: swap`, size-adjust fallback. No runtime request to any font host.

**Inter** — UI and prose · **JetBrains Mono** — stack chips, evaluation lines, status label.

| Token | Desktop | Mobile ≤640 | Line height | Weight | Tracking |
|---|---|---|---|---|---|
| `display` | 56px | 36px | 1.05 | 600 | -0.02em |
| `h1` | 40px | 30px | 1.15 | 600 | -0.02em |
| `h2` | 30px | 24px | 1.2 | 600 | -0.01em |
| `h3` | 20px | 18px | 1.3 | 600 | -0.01em |
| `body-lg` | 18px | 17px | 1.65 | 400 | 0 |
| `body` | 16px | 16px | 1.65 | 400 | 0 |
| `small` | 14px | 14px | 1.5 | 400 | 0 |
| `micro` | 12px | 12px | 1.4 | 500 | 0.04em |

Prose measure capped at `68ch`; hero headline at `20ch`.

### 8.2 Colour tokens

Dark default, full light sibling, one accent. Every pair verified numerically by
`scripts/check-contrast.mjs` **before** any UI is built, and adjusted if it misses.

**Dark** — `bg #0B0C0E` · `surface #131417` · `surface-raised #1A1C20` · `border #292C33` ·
`text #E9EAEC` · `text-secondary #A2A7B0` · `text-muted #767B85` · `accent #8AB4F8` ·
`accent-quiet #1E293B` · `status-ongoing #E0A458`

**Light** — `bg #FFFFFF` · `surface #F7F8F9` · `surface-raised #EFF1F3` · `border #D9DDE2` ·
`text #111317` · `text-secondary #4A5058` · `text-muted #6B717A` · `accent #1A56DB` ·
`accent-quiet #EBF1FE` · `status-ongoing #8A5A12`

Targets: body ≥ 4.5:1, large text and UI borders ≥ 3:1. `status-ongoing` is the only second
colour and is purely semantic — it marks one factual state and appears nowhere decorative.

### 8.3 Spacing, radius, depth

4px base: `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128`. Container `max-width 1120px`,
gutter 24/20px. Section padding block 96/56px. Card padding 24/20px. Radius 4px chips, 8px
cards and buttons, 12px media frames. Hairline 1px borders, always a token. One shadow, for
card hover: `0 1px 2px rgb(0 0 0 / 0.28)`.

### 8.4 Motion

150ms hover/focus colour and border · 200ms transform · 250ms section entrance ·
`cubic-bezier(0.2, 0, 0, 1)` throughout. Entrance fires **once per section** via
`IntersectionObserver` with `once: true` — not per card, never re-triggering on scroll back.

Content is `opacity: 1` by default and only starts from 0 when motion is permitted, so
reduced-motion and no-JS users never meet an invisible section. A global
`prefers-reduced-motion: reduce` block zeroes durations and disables smooth scrolling.

### 8.5 Layout per tier

- **Flagship** — asymmetric split, media 7 columns / detail 5, sides alternating between the
  two. Stack, status, evaluation and links visible without interaction;
  problem / approach / implementation behind a `<details>` disclosure that works without JS.
- **Standard** — uniform 2-up grid, 3-up at ≥1280px. Stack and links exposed with no click.
- **Compact** — one bordered list, one row per program, one shared repo link.

Device mockups only where a real screenshot exists.

### 8.6 Breakpoints

`360` floor · `640` · `768` · `1024` · `1280` · `1536`. Redesigned, not scaled: nav collapses
to a disclosure below 768; flagship split stacks below 1024 with media *after* text;
standard grid goes 1-up below 768; stack chips wrap via flex with `min-width: 0` and
`overflow-wrap: anywhere` so long strings cannot force horizontal overflow. 44px minimum tap
targets via a padding floor on every interactive element.

---

## 9. Open conflicts and confirmations

### 9.1 Resume rebuild — what content goes in it? **Open, blocking the PDF only**

Decision 10 says rebuild the resume as a text-based ATS-readable PDF, and "do not invent or
alter factual information". Those two instructions pull apart, because the existing PDF's
content is itself partly wrong or stale:

| In the current PDF | Problem |
|---|---|
| Travel Planner "Built using **Django**, HTML, CSS, and MySQL" | The repository contains **PHP** and MySQL. No Django anywhere. Transcribing this reproduces a claim your own repo contradicts. |
| Email `aarizmega@gmail.com` | Superseded by decision 4 of the earlier round. |
| LinkedIn `/in/aariz-khan-5b46b3292` | Superseded. |
| No CGPA at all | 8.8 is confirmed but adding it *is* adding content. |
| Six ML projects absent | Every one exists in a repository. |
| Internships, certificates present | Omitted from the site by decisions 7 and 13 — unclear whether that extends to the PDF. |

A literal transcription would ship an ATS-readable PDF containing a factually wrong stack
claim and dead contact details. Correcting it means the rebuild changes content, not just
format.

**My recommendation, pending your word:** rebuild from `TRUTH-LEDGER.md` — confirmed
identity and contact, education with CGPA 8.8, the eight verified projects described as the
code supports, the skills list as grouped, phone included. Omit internships and
certifications for consistency with the site. Nothing invented; the only *removals* are
claims the repositories contradict.

Three specific questions:

1. Internships in the PDF — include or omit?
2. Certifications in the PDF — include or omit?
3. Confirm the Travel Planner line is corrected from Django to PHP.

Everything else in the plan proceeds regardless; only `public/resume/*.pdf` waits.

### 9.2 RAG `statusNote` provenance — confirming, not blocking

Decision 5 authorises describing what I verified in the repository. The in-progress note is
verified — the files exist and their exported functions are unambiguous — but they are
*uncommitted*, so they show what is being attempted rather than what is settled. I am
proceeding with the wording in §7.1 and recording the provenance in the ledger. Say so if
you want it dropped or reworded.

### 9.3 The superseded CGPA figure in `AUDIT.md` — still your call

Zero instances in `PLAN.md`, `TRUTH-LEDGER.md`, the data files and all copy. `AUDIT.md`
retains four, each inside the record of what your older source documents physically contain,
each annotated as superseded. Rewriting them would make the audit falsely report a file's
contents, which zero-fabrication forbids. Deleting that record is available on request.

### 9.4 Resolved this round

- **Iris metric** — not published (decision 2). No longer a TODO.
- **Sales R²** — `0.525` confirmed (decision 3).
- **SQL label** — "Basics" retained (decision 4), though repository evidence exceeds it;
  recorded in ledger §7 so the conservative choice is auditable.

---

## 10. Resume PDF build

`scripts/build-resume.py`, using PyMuPDF, which is already installed and writes real text.
Not shipped, and not run until §9.1 is answered.

Requirements it must meet: selectable text throughout (the current file is a flat image with
zero extractable characters), a single column with no text boxes or tables that break ATS
parsing, embedded standard fonts, correct document metadata (title, author), phone included,
and content drawn only from `TRUTH-LEDGER.md`.

Output `public/resume/aariz-khan-resume.pdf`, served by `/resume` for both view and
download. Verification re-extracts the text with PyMuPDF and asserts a non-zero character
count — the exact check the current file fails.

---

## 11. Screenshots (decision 6)

### 11.1 Capturable

**AI Resume Analyzer.** Every dependency is installed (Streamlit 1.49.1,
sentence-transformers 5.1.0, Plotly 6.7.0, PyMuPDF) and `all-MiniLM-L6-v2` is already in the
local Hugging Face cache, so no download is needed. Capture: the analysis dashboard in real
state at ≥1440px showing the ATS check, match score, missing-skill count and radar chart.

Ordering dependency: the input must be a **text-based** PDF, because the current image-only
resume extracts zero words and would trip the ATS warning, producing a screenshot that
misrepresents the tool. So the resume rebuild precedes this capture and supplies its input.
The job description will be a generic public posting, not a real application.

### 11.2 Attempted, never faked

**RAG Chatbot.** `node_modules` present, Ollama 0.30.11 installed. Capture target: the chat
interface answering from an ingested document with citations visible, ≥1440px. Two real
risks — the working tree is mid-refactor on structured formats and may not build, and
genuine retrieval needs the Supabase project reachable.

If either blocks, per decision 6 there is no substitute screenshot. The `MediaFrame` renders
its labelled empty state and `VERIFICATION.md` carries an exact TODO naming project, screen,
application state and viewport for you to capture.

### 11.3 Rules applied to every capture

Real application state only; no mocked UI, no fabricated transcripts, no invented numbers.
The visible surface is scrubbed of keys, `.env` contents, connection strings, Supabase
project refs and anon keys, and personal data. The RAG `/admin` page is **not** captured, as
it surfaces configuration. Output is WebP with explicit width and height, stored at
`public/media/<slug>/…` and referenced only from `projects.ts`.

---

## 12. Dependencies

**Production dependencies beyond the framework: none.**

| Candidate | Verdict | Reason |
|---|---|---|
| `lucide-react` / `react-icons` | **No** | 8 icons needed. A local `Icon.tsx` of inline SVG costs ~2 KB, one family at one weight, zero dependency. |
| `framer-motion` | **No** | The whole motion budget is two CSS transitions and one `IntersectionObserver`. ~34 KB gzipped to replace ~20 lines of CSS is not defensible. |
| `next-themes` | **No** | A `data-theme` attribute plus a ~15-line pre-hydration script. |
| `react-pdf` / `pdfjs-dist` | **No** | `/resume` uses a native embed with a link fallback. Hundreds of KB for a capability the browser already has. |
| `@vercel/og` | **No** | `next/og` ships with Next 16. |
| `axe-core` | **Yes — devDependency** | Required by the brief's own gate ("zero axe-core violations") and the verification phase. Dev-only, **0 bytes shipped**. |

One devDependency total. Shipped JavaScript is Next.js and React plus component code; the
only client components are the theme toggle, the mobile nav disclosure and the entrance
observer.

---

## 13. Security

- The credential is never reproduced — not in code, comments, copy, commit messages, any
  deliverable, or any captured image. It has already been redacted from `AUDIT.md` §7.1 with
  the finding preserved.
- No vulnerability narrative appears on the portfolio.
- `scripts/scan-secrets.mjs` runs before finalisation across every generated file, matching
  common key, token, password and connection-string patterns. `VERIFICATION.md` records
  **pass/fail only**, quoting nothing.
- A scan of all eight repositories found no additional exposed credentials; the two pattern
  hits were false positives. No repository of yours is modified.

---

## 14. File-by-file list

All **create**.

**Config (7)** `package.json` · `tsconfig.json` · `next.config.ts` · `postcss.config.mjs` ·
`eslint.config.mjs` · `.gitignore` · `README.md`

**App (8)** `app/layout.tsx` · `page.tsx` · `globals.css` · `resume/page.tsx` ·
`not-found.tsx` · `robots.ts` · `sitemap.ts` · `opengraph-image.tsx`

**Components (25)** per §4.

**Data + types (7)** `src/types/content.ts` · `src/data/projects.ts` · `skills.ts` ·
`education.ts` · `certifications.ts` · `site.ts` · `src/lib/motion.ts`

**Assets (5)** `public/resume/aariz-khan-resume.pdf` · `public/media/<slug>/*.webp` ·
`favicon.ico` · `icon.svg` · `apple-icon.png`

**Tooling, not shipped (3)** `check-contrast.mjs` · `scan-secrets.mjs` · `build-resume.py`

**Docs (5)** `AUDIT.md` · `PLAN.md` · `TRUTH-LEDGER.md` · `VERIFICATION.md` · `REVIEW.md`

---

## 15. Remaining TODOs

| # | Item | Blocks |
|---|---|---|
| 1 | `SITE_URL` final domain | **No longer blocking.** A Vercel production build resolves the origin from `VERCEL_PROJECT_PRODUCTION_URL`, so canonical, OG, sitemap and JSON-LD are all correct on deploy. Setting the domain later is one line in `site.ts` or one environment variable. See `README.md`. |
| 2 | Resume content questions — §9.1 | The PDF only. Nothing else waits. |
| 3 | RAG screenshot feasibility | One media frame; falls back to a labelled empty state plus an exact capture TODO. |

Certifications are **not** a TODO — omitted by decision, structure empty and silent.
The Iris metric is **not** a TODO — resolved by decision 2.

---

## 16. Phase 2 order

1. Scaffold, config, tokens, fonts; run `check-contrast.mjs` and fix tokens **before** UI.
2. Types and data files.
3. Primitives, then layout shell.
4. Sections in IA order, rendering from data only.
5. Resume PDF (once §9.1 is answered) → Resume Analyzer capture → RAG capture attempt.
6. `/resume`, SEO surface, OG image.
7. `TRUTH-LEDGER.md` completed alongside the copy.
8. Phase 3 verification: build, typecheck, lint, every route, every link, screenshots at six
   widths, axe, keyboard pass, reduced motion, the data-schema acceptance test, and the
   secret scan — real output pasted.
9. Phase 4 recruiter review, then fix the three weakest things.

**Stopping here. No application source code until you approve this file.**

---

# 3D Architecture — Plan Revision Round 2

Status: **awaiting approval. No 3D dependency is installed and no scene code
exists in the project.** The measurements below come from prototypes bundled in
a scratch directory outside this repository, which is the only way to report a
real number rather than a guess.

---

## V1 — Three concepts, each derived from the work

### Concept A — Embedding space

A projection of a high-dimensional embedding space into two visible dimensions.
Points drift slowly; points whose source documents are semantically related sit
in loose clusters, and as the pointer moves, the cluster nearest the cursor
resolves into focus while the rest stay soft. The semantic link is direct: both
flagship projects turn text into vectors and reason about where those vectors
sit relative to one another. The risk is that a cloud of dots is exactly the
shape the banned clichés take, and the difference between "an embedding space"
and "a particle sphere" is legible only to someone already inclined to look.

### Concept B — Retrieval event

A query point enters the space. Distances resolve, the nearest neighbours
illuminate in order of proximity, and the retrieved set converges toward the
query while everything else dims. This is a literal depiction of what the RAG
pipeline does on every request: embed the query, search the index by cosine
distance, take the top matches. It is the most semantically precise of the
three, and the most narrative — which is also its risk, because a looping story
draws the eye repeatedly and competes with the hero copy.

### Concept C — Similarity field

No dots and no lines. A continuous scalar field where proximity to a set of
embedded points is encoded as **light intensity** rather than as geometry.
Bright regions are dense neighbourhoods of meaning; dark regions are sparse.
Because nothing is ever drawn as a connected node graph, the entire "glowing
neural network" vocabulary is structurally unavailable. It reads as a physical
field rather than as an object, which is unusual on a portfolio and cannot be
mistaken for a generic marketing backdrop.

### Chosen: **C, with B's behaviour**

The visual language is the similarity field; the interaction is the retrieval
event. The pointer acts as a query — the field re-weights around it, and the
nearest neighbourhoods brighten in proportion to distance. Nothing is ever
connected by an edge, so the cliché is avoided at the level of the rendering
model rather than by taste.

**What a viewer should intuit, in one sentence:**

> Meaning has a geometry — things that mean similar things sit close together,
> and asking a question lights up whatever is nearest to it.

That sentence is the test. It describes retrieval by semantic distance, which is
what the flagship project is, and it would be false on a marketing site for an
unrelated product — which is precisely the property the brief asks for.

Concepts A and B are rejected as the *visual*: A because its silhouette is
indistinguishable from the banned particle cloud, B because a repeating
narrative animation next to a hero heading competes for attention with the copy
that has to pass the five-second test.

---

## V2 — Dependency ladder, measured

Every rung was bundled with esbuild (`--bundle --minify --format=esm`) and
gzipped at level 9. Rungs 2 and 3 are working prototypes of the chosen concept;
rungs 4-6 are the minimum viable point-cloud scene in each library — a renderer,
a camera, one geometry, one shader material — with no loaders, controls, or
helpers, so those figures are a floor rather than a realistic total.

| Rung | Approach | Gzipped | Verdict |
|---|---|---|---|
| 1 | CSS + SVG | ~0 KB | Rejected — cannot express a continuous field responding to a pointer. |
| 2 | 2D canvas, projected point cloud | **0.56 KB** | Viable fallback. Rejected as primary: per-point fills run on the CPU, and the field has to be faked with sprites. |
| 3 | **Raw WebGL, one fullscreen quad, one fragment shader** | **1.36 KB** | **Chosen.** |
| 4 | OGL micro-wrapper | **13.3 KB** | Rejected — buys a scene graph the concept does not use. |
| 5 | three.js, tree-shaken, bare imports | **127.6 KB** | Rejected — **already over the 100 KB budget** before any scene exists. |
| 6 | React Three Fiber + drei | **236.8 KB** | Rejected — 174x rung 3 for the same picture. |

Rung 3 is not chosen because it is easier to write; it is chosen because a
similarity field *is* a fragment shader. The field is evaluated per pixel by
definition, so there is no geometry to manage, no scene graph to traverse and no
material system to configure. Rungs 4-6 all exist to manage objects in a scene,
and this concept has no objects.

**Measured cost against budget: 1.36 KB gzipped against a 100 KB budget — 1.4%.**
Lazy-loaded and code-split, so it is absent from the critical path entirely.

Rung 5's figure deserves emphasis: a bare three.js point cloud with no features
costs **94x more than the entire chosen implementation**, and on its own breaches
the budget the brief set. That is the whole argument.

---

## V3 — Performance budget

Baseline measured before any 3D work — five Lighthouse runs, mobile emulation,
on an otherwise idle machine:

| Metric | Baseline (no 3D) | Budget with 3D |
|---|---|---|
| Performance (median) | 95 | >= 95, no regression |
| LCP | 2.0-2.8 s | must not increase |
| TBT | 84-115 ms | +0 ms from scene setup; no long task > 50 ms |
| CLS | 0.000 | <= 0.1 |
| Client JS (gzipped, all chunks) | 181 KB | +1.36 KB, lazily loaded |

Rules the implementation must satisfy:

- The canvas is **never** the LCP element. It is absolutely positioned behind the
  hero text, mounted after first paint, and starts fully transparent.
- Initialisation happens on `requestIdleCallback` or on intersection, never
  during hydration.
- Device pixel ratio capped at 2 desktop, 1.5 mobile.
- The loop pauses on `visibilitychange` and when the canvas leaves the viewport.
- `dispose()` deletes the buffer and program and calls `WEBGL_lose_context`, so
  navigating away releases the context rather than leaking it.

---

## V4 — Four tiers

| Tier | Condition | Renders |
|---|---|---|
| **0 — Poster** | No JS · `getContext('webgl')` returns null · `Save-Data: on` | Static WebP exported from the real shader at its best frame |
| **1 — Static** | `prefers-reduced-motion: reduce` | One `renderOnce()` call, or the poster. **No loop is started, and where the poster suffices no context is created.** |
| **2 — Reduced** | `hardwareConcurrency <= 4` · `deviceMemory <= 4` · coarse pointer · or measured FPS below floor | Fewer field points, no pointer parallax, slower ambient motion, DPR capped at 1 |
| **3 — Full** | Everything else | Full field, pointer parallax, ambient drift |

The tier 0 poster is exported from the shader itself by rendering one frame
headless and saving the canvas, so it is the same image rather than a stand-in.
It ships in the initial HTML as a plain `<img>` with explicit dimensions, which
means the hero is complete and finished-looking with zero JavaScript — and it is
what a link-preview crawler sees.

Runtime downgrade: a rolling frame-time sample over two seconds. Below 30 fps at
tier 3 drops to tier 2; below 30 fps at tier 2 drops to tier 1. **It never
upgrades again** — a device that struggled once will struggle again, and
oscillating between tiers is worse than staying low.

---

## V5 — Interaction

- Pointer parallax bounded at <= 20px of field displacement, damped with a lerp
  factor around 0.06, so it lags the cursor and reads as depth rather than as a
  toy that follows the mouse.
- The canvas carries `pointer-events: none`. There is no hit-testing, so the
  CTAs above it cannot lose a click.
- No scroll-jacking and no cursor replacement. Ambient motion stops when the
  hero leaves the viewport.
- Touch devices get no pointer parallax and no gesture handlers, so nothing
  competes with scrolling.

---

## V6 — Accessibility

- `aria-hidden="true"`, no `tabindex`, not focusable. The canvas is decorative.
- Every word in the hero — `h1`, discipline line, headline, both CTAs — is real
  DOM layered above the canvas and fully readable if the canvas never renders.
- **Contrast is verified against the worst-case frame, not the average.** The
  method: render the shader headless across a sweep of time and pointer
  positions, sample the pixels in the rectangles the hero text actually occupies,
  take the brightest sample per rectangle, and compute the ratio against the text
  colour. The number reported in `VERIFICATION.md` is the minimum across the
  sweep. If it cannot clear 4.5:1 a scrim is added behind the text and the sweep
  is re-run — and if the scrim damages the design, V9 applies.
- Honours `prefers-reduced-motion` and `prefers-reduced-transparency`.
- The field's brightness changes are continuous and slow; nothing approaches 3Hz.

---

## V7 — Where it is allowed

One instance, one scene, in the hero only. Nothing below the hero animates.
Skills, education, about, contact, dividers, footer, page transitions and the
cursor all stay exactly as they are now.

---

## V8 — Flagship visuals

| Project | Visual | Reason |
|---|---|---|
| AI Resume Analyzer | **The real screenshot, already captured** | A real capture of the real dashboard exists and is wired in. Nothing is overlaid on it. |
| AARIZ AI (RAG chatbot) | **An accurate architecture diagram of the real pipeline** | No genuine screenshot could be produced without writing documents into the live Supabase project. A correct diagram of the traced pipeline — ingestion via unpdf, chunking, embedding, pgvector store, hybrid retrieval, rerank, provider layer (Ollama / Gemini), generation — tells an engineer more than any abstract object, and every box in it maps to a file in the repository. |

The diagram is an SVG built from the same traced facts as the project copy, so it
is subject to the Truth Ledger like everything else. It is not decorative 3D and
it is not a fabricated UI. **No mock chat transcript, invented dashboard or
fabricated metric will be rendered as though it were the application.**

---

## V9 — Kill criteria, committed in advance

After at most two optimization passes, the 3D is abandoned or downgraded a rung
if any of these hold:

1. Mobile Lighthouse Performance median drops below 95
2. LCP exceeds 2.5 s or CLS exceeds 0.1 **attributable to the canvas**
3. Incremental gzipped JS exceeds 100 KB
4. A mid-range mobile profile cannot hold 30 fps at tier 2
5. Worst-case text contrast over the scene cannot reach 4.5:1 without a scrim
   that damages the design
6. The concept still looks generic after two design iterations

Falling back to rung 2 or rung 1 is recorded as a **successful outcome**, not a
failure, and will be reported as such rather than quietly shipped.

---

## V10 — Test protocol

Each of these produces a number or an image in `VERIFICATION.md`:

1. Rendered scene at 1440px desktop and 390px mobile.
2. `prefers-reduced-motion: reduce` forced — assert no `requestAnimationFrame`
   loop starts and the static state looks finished.
3. WebGL disabled via a `getContext` override — assert the tier 0 poster shows.
4. JavaScript disabled — assert the hero is complete and readable and both CTAs
   work.
5. 4x CPU throttle with a mid-tier profile — record frame rate, assert tier
   detection and the runtime downgrade both fire.
6. Lighthouse mobile with and without the canvas, both reported side by side.
7. Gzipped bundle delta attributable to the hero visual.
8. Navigate away and back ten times — assert the WebGL context count does not
   grow and the JS heap returns to baseline.
9. Keyboard-only pass through the hero — focus order unchanged, nothing trapped.
10. Worst-case contrast over the animated scene, by the sweep described in V6.

---

## Summary for approval

- **Concept:** a similarity field that responds to the pointer as a query.
- **Rung:** 3 — raw WebGL, one fullscreen quad, one fragment shader.
- **Measured cost: 1.36 KB gzipped** against a 100 KB budget, lazily loaded.
- **three.js was rejected on measurement**, not preference: 127.6 KB gzipped for
  a bare point cloud already breaches the budget.
- **The RAG flagship gets an architecture diagram**, not a decorative scene.
- Nothing below the hero animates.

**Approved 2026-08-27. Implementation record follows.**

---

# 3D Architecture — approved, implementation record

Approved 2026-08-27. This section records what was actually built, and the two
places where implementation differed from the proposal above.

## Layout decision — no hero text ever sits over the canvas

The proposal assumed the canvas would sit behind the hero text with contrast
verified against the worst-case frame, and a scrim added if it failed. During
implementation a better option became available, because the hero already had a
problem worth solving: at 1440px and wider, the right half of the first screen
was empty, which `REVIEW.md` recorded as the third weakest thing on the site.

So the canvas occupies that space instead of sitting behind the words:

| Width | Layout |
|---|---|
| ≥ 1024px | Text in the left column, scene in the right. They do not overlap. |
| < 1024px | **No visual at all.** The hero is text and calls to action, which is what it was before this work. See the revision note below — this changed on measurement. |

This is strictly stronger than a scrim. A scrim makes the contrast ratio
acceptable; a layout in which no text is ever drawn over the canvas makes the
question not arise. `VERIFICATION.md` reports the measured proof that no hero
text rectangle intersects the canvas rectangle at any tested width, which is a
geometric guarantee rather than a per-frame sample.

It also means the canvas fills the dead space that made the hero read as
unfinished, so one change closes two findings.

## What ships

**`src/lib/similarity-field.ts`** — the whole renderer. Raw WebGL, one fullscreen
triangle, one fragment shader, no dependency. Exposes `create`, `start`, `stop`,
`renderOnce`, `setQuery`, `setTier` and `dispose`.

The field is a sum of Gaussians over 18 fixed points arranged in four loose
clusters — semantic neighbourhoods, not a uniform scatter. Three things are drawn
from that one scalar field:

- a soft glow where the field is dense
- faint isolines, which are contours of the distance field rather than edges
  between nodes, so the "connected dots" vocabulary is never used
- small bright cores at the points themselves

The pointer is the query. Each point's weight is multiplied by its proximity to
the pointer, so moving the cursor re-weights the field and the nearest
neighbourhood brightens — the retrieval behaviour from concept B, expressed in
the visual language of concept C.

Point positions are a fixed table rather than random, so the poster export and
the live scene are the same picture.

**`src/components/hero/HeroCanvas.tsx`** — tier detection, lifecycle, and the
runtime downgrade. Under 100 lines.

## Tiers as implemented

| Tier | Detected by | Behaviour |
|---|---|---|
| 0 | No JS · `getContext('webgl')` null · `Save-Data: on` | Poster `<img>`, which is in the server markup and needs nothing to run |
| 1 | `prefers-reduced-motion: reduce` | Poster stays. **No WebGL context is created at all.** |
| 2 | `hardwareConcurrency ≤ 4` · `deviceMemory ≤ 4` · coarse pointer · or measured FPS below floor | Canvas, 10 points, no pointer parallax, DPR capped at 1 |
| 3 | Everything else | Canvas, 18 points, pointer parallax, DPR capped at 2 |

The poster is rendered in the server HTML on every request and the canvas fades
in over it once a scene actually starts. That ordering is what makes tier 0 and
tier 1 free: they are not a fallback that has to be constructed, they are what
the page already is before any script runs.

The poster is exported from the shader itself by `scripts/export-poster.mjs`,
which renders one frame headless and saves the canvas. It is the same image, not
a stand-in.

Runtime downgrade samples frame times over a two-second window. Below 30fps at
tier 3 drops to tier 2, below 30fps at tier 2 drops to tier 1 and destroys the
context. It never upgrades.

## Reduced motion

Reduced motion is checked before a context is created, not after a loop starts.
The `matchMedia` result gates construction, so a reader with the preference set
never allocates a WebGL context, never runs a frame, and never downloads
anything extra — they get the poster that was already in the HTML.

## Mobile — changed on measurement

The plan was a short band below the calls to action at reduced intensity. It was
built, measured, and removed. What the numbers said:

| Build | Mobile Lighthouse Performance | LCP | LCP element |
|---|---|---|---|
| Before any 3D | 95 median | ~2.7s | hero paragraph |
| Scene + poster on mobile | **88 median** | 2.7–3.15s | **the poster** |
| After optimization pass 1 | 87 median | 2.6–2.8s | the poster |
| After optimization pass 2 | 93 median | 2.6–2.8s | the poster |
| Scene and poster desktop-only | **96 median** | ~2.7s | hero paragraph |

Two V9 criteria had fired: Performance below 95, and the canvas becoming the
largest contentful paint, which V3 forbids outright. The field's own chunk was
also producing long tasks of 195ms and 73ms, past the 50ms ceiling.

Both optimization passes were spent — a single transparent poster and post-load
booting first, then scoping the canvas to fine pointers — and neither recovered
the gate. So the rule in V9 applied: downgrade rather than ship a compromised
site.

Below 1024px there is now no scene, no poster, and no WebGL context. That is a
better product decision as well as a faster one: the query interaction is the
whole concept, it needs a pointer, and without one the scene is an animated
background spending a phone's battery.

**This is recorded as a successful outcome, not a failure**, exactly as V9 says
it should be. Desktop, where the scene runs, measures 100 on all four Lighthouse
categories with no long tasks at all.

## Performance impact

Reported with real before/after numbers in `VERIFICATION.md`. The budget:
1.36 KB gzipped measured for the renderer, against 100 KB allowed, lazily
imported so it is absent from the critical path. The poster image is the one
genuinely new cost on first paint, and it is measured rather than assumed —
if it displaces the text as the LCP element and makes LCP worse, V9 applies.

## Flagship visual — RAG chatbot

Per V8, the RAG project gets an architecture diagram of the real pipeline rather
than a decorative scene: an inline SVG, theme-aware, every box mapping to a file
in the repository. It replaces the labelled empty state that `REVIEW.md` called
the weakest thing on the site.

---

# 3D EXPERIENCE REDESIGN — V2

Date: 2026-08-28
Status: **proposed. Nothing has been replaced. The current implementation is
untouched and still passing every gate.**

Per §24 of the brief, this documents the architecture before any file is
replaced. §7 asks for a technology recommendation with reasons, and §15 keeps
the existing performance targets. Those two requirements are in direct tension,
and the whole of §3 below is the measured account of that tension. It needs a
decision from you before implementation starts.

---

## 1. What was inspected

| Area | State found |
|---|---|
| Framework | Next.js 16.3.1, React 19.2.8, TypeScript 5, Tailwind 4. Nine routes, all statically prerendered. |
| Current 3D | `src/lib/similarity-field.ts` — raw WebGL, one fragment shader, 2,345 bytes gzipped in its own lazy chunk. Desktop and fine-pointer only. |
| Dependencies | Production: `next`, `react`, `react-dom`. Nothing else. One devDependency, `axe-core`. |
| Client JS | **188,885 bytes gzipped**, all chunks. |
| Performance | Mobile Lighthouse 96 median (5 runs), LCP ~2.7s, TBT 53–137ms, CLS 0. Desktop 100/100/100/100, LCP 0.6s, TBT 0–26ms, no long tasks. |
| Content | Eight projects in `src/data/projects.ts`. Components hold no project copy; adding one is a single appended object. |
| Truth Ledger | Authoritative. Every rendered claim maps to a resume line, a repository file, or a confirmed answer. |

The content architecture, the data contract, the design tokens, the resume
pipeline, the verification harness and the Truth Ledger are all independent of
the visual layer and are **kept**. This redesign replaces the hero visual and the
page choreography, not the system underneath.

---

## 2. RAG chatbot status — verified, and it changes

§29 requires verifying the deployment before changing the status. Done, and the
status change is justified:

**Deployment, driven like a visitor** (`scripts/verify-deployed-rag.mjs`):

```
GET https://aariz-ai-three.vercel.app        200, no redirects, <title>AARIZ AI</title>
GET /api/health   {"ok":true,"llm":"available","database":"available"}
composer rendered, question typed and sent through the app's own controls
answer returned: "The uploaded documents do not contain the information
                  needed to answer this question."
```

That is the pipeline running correctly: retrieval executed, found nothing
relevant in an empty corpus, and the model refused rather than inventing an
answer. A working grounded refusal is evidence the system works, not evidence
it does not.

**Repository, re-inspected today** — it has moved substantially since the audit:

```
35a5040 Land confirmation links on a page that says the email was verified
82b23ca Read scanned PDFs, and put every size limit in one place
a4cd4e8 Ground answers in retrieved evidence, close the zero-API embedding leak
39e180d Support eight document formats through the one existing pipeline
working tree: clean
```

The thing the site currently calls "in progress" — extending ingestion to
structured formats — **is committed and shipped**. The working tree is clean, so
nothing is in flight.

Newly verifiable facts, from source:

- 13 extensions across 9 source types: `pdf, html, markdown, csv, json, docx, doc, xlsx, xls`
- OCR path in `src/lib/ingest/extract.ts` for scanned PDFs
- Answers grounded in retrieved evidence

**Therefore:** `status: 'completed'`, `statusNote` removed, no "In progress"
badge, and the copy gains the document-format and OCR capabilities. Recorded in
the Truth Ledger with the commit hashes.

**One flag, unchanged from the last review.** `README.md` in that repository
still opens with *"Status: Level 3 of 25 — connected to a local model."* A
recruiter who follows the link from this portfolio lands on a README describing
a far weaker project than the one that exists. That is outside this repo and I
have not touched it, but it is now the single most damaging thing about how this
project reads.

---

## 3. Technology — the decision that needs you

### The measured problem

§15 keeps Lighthouse mobile ≥95, LCP <2.5s. §6 asks for realistic lighting,
shadows, reflections and GLTF models. I measured what that costs. Each figure is
a real esbuild bundle, minified, gzip -9, of a *realistic* scene — PBR materials,
shadow map, environment lighting, `GLTFLoader` + `DRACOLoader`:

| Approach | Gzipped | Versus current whole site (188.9 KB) |
|---|---|---|
| Bare three.js, tree-shaken | **152.5 KB** | +81% |
| three + React Three Fiber, no drei | **248.1 KB** | +131% |
| three + R3F + drei | **282.4 KB** | +150% |

For context, the *entire current site* — React, Next, every component, the
existing shader — is 188.9 KB. A realistic three.js scene is 152.5 KB on its own.

The harder number is this one, already measured on this project: the **1.4 KB**
shader currently in the hero dropped mobile Lighthouse from 95 to 87 and became
the largest contentful paint, and no amount of optimisation recovered it. It had
to be made desktop-only. Lighthouse renders WebGL in software; a 152 KB scene
with shadow maps will be dramatically worse than a 1.4 KB one.

**On the evidence I have, a runtime 3D scene on mobile cannot hold Lighthouse
mobile ≥95.** I would rather say that now than discover it after building.

### Option A — runtime three.js, desktop only

Bare three.js with bare imports. **Not** React Three Fiber: this scene is driven
by scroll position, not by React state, so R3F's declarative reconciliation buys
little here while costing 96 KB more than three.js alone. That is a measured
trade, not a preference.

- ~152 KB library + ~8 KB scene code, lazily imported after `load`, desktop only
- Mobile gets a designed static composition, never the scene
- **Requires raising the JS budget from 100 KB to ~160 KB** for the desktop chunk
- Desktop has the headroom: it currently measures 100 with LCP 0.6s and TBT 0–26ms

### Option B — pre-rendered cinematic sequence  ← my recommendation

Render the 3D environment **offline** at high quality, export an image sequence,
and scrub it with scroll.

This is how most high-end "3D" product sites actually work, and it inverts the
trade-off in our favour:

- **More realistic, not less.** Offline rendering is not bound by 60fps, so it
  affords real soft shadows, true reflections, depth of field and global
  illumination that a real-time scene cannot afford. §6 asks for *more* realism
  than the current shader; this delivers considerably more.
- **Zero 3D framework in the shipped bundle.** No three.js, no R3F, no GLTF
  loader, no draw calls, no WebGL context, no GPU work on the visitor's device.
- **It works on mobile**, which Option A does not. Fewer frames, smaller
  dimensions, same art direction.
- **It degrades perfectly.** One frame is the poster. No WebGL means no fallback
  problem to solve — the fallback is the same asset.
- **Scroll-driven by construction.** Frame index is a pure function of scroll
  offset, which is exactly the choreography §3 describes.
- Reduced motion is trivially correct: pin to a single chosen frame.

Cost is image bytes rather than JavaScript: roughly 60–90 AVIF/WebP frames per
chapter transition at ~12–25 KB each, streamed and cached, decoded one at a
time. Only the first frame is on the critical path. The scrubber itself is about
2 KB of code.

I can produce these frames here: the existing headless-Chrome harness already
renders three.js offscreen and exports WebP — that is how the current hero
poster was made. Three.js becomes a **build-time** dependency, not a shipped one.

### Recommendation

**Option B for the environment**, because it is the only one of the two that
satisfies §6 (more realistic) and §15 (do not sacrifice performance) at the same
time, and the only one that gives mobile a real 3D experience rather than a
consolation prize.

If you want live pointer interactivity inside the scene, that is the one thing
Option B cannot do, and it would argue for A. Tell me which matters more.

---

## 4. Scene concept — original, and derived from the work

**"One document, becoming an answer."**

A single continuous dark volume, softly lit, with one accent light. The camera
travels through it on a gentle path. There is no city, no grid floor, no
particles, no neon. The material language is matte paper, brushed dark metal and
one warm key light — closer to a product photography set than to a game.

The narrative is literally his RAG pipeline, staged as physical objects:

| Beat | What is on screen | What it maps to |
|---|---|---|
| Rest | One sheet, floating, catching a soft key light | A document |
| Fracture | The sheet separates into stacked slabs with visible overlap | Chunking, ~600–900 tokens with ~100 overlap |
| Compress | Slabs contract into small dense tokens on a lattice | Embedding into a vector space |
| Query | A single object enters; nearby tokens brighten by distance | Retrieval by cosine similarity |
| Assemble | The nearest few lift out and align into a panel with small citation marks | Grounded answer with sources |

Every beat is a step that exists in the repository. Nothing in the scene is
decorative-only, and nothing claims a capability the code does not have.

For Chapter 03 the same material language, different staging: two sheets — a
résumé and a job description — brought face to face, with the gap between them
lit in proportion to similarity.

From Chapter 04 the environment recedes. The camera pulls back into calm empty
volume and the UI becomes primary, because §22 is right that the content is the
product.

---

## 5. Scroll choreography

Eight chapters, each a discrete scroll range with a named label, exactly as §4
asks. The camera never moves except as a function of scroll offset, so the
visitor's only inputs are scroll and click.

```
01 INTRO      rest              hero copy, Explore Projects, View Resume
02 WORK       fracture→compress RAG chatbot: completed, Live Demo, View Source
03 WORK       query→assemble    AI Resume Analyzer, real screenshot
04 PROJECTS   recede            five standard projects, clean grid
05 SKILLS     calm              six grouped lists, no sphere, no cloud
06 ABOUT      calm              short first-person text
07 EDUCATION  calm              CMR University, 2023–2027, CGPA 8.8
08 CONTACT    settle            GitHub, LinkedIn, Email, Resume
```

A persistent chapter indicator sits in the corner (`02 / WORK`) so the visitor
always knows where they are. Navigation stays in the header at all times and is
never hidden inside the scene.

## 6. Camera

Frame index is a pure function of scroll offset, eased, with no spring that can
overshoot and no motion that continues after the visitor stops. No orbiting, no
spinning, no free camera, nothing to learn. Scroll up and the sequence runs
backwards exactly.

## 7. Loading

The first frame ships as a normal `<img>` with explicit dimensions, so the hero
is complete at first paint with no JavaScript. Remaining frames stream in the
background after `load`, lowest-resolution tier first. There is no loading gate
and no "INITIALIZING" screen, because there is nothing to wait for — §16's
requirement that the visitor never sees a blank screen is met by never having
one.

## 8. Performance budget

| Metric | Current | Budget after V2 |
|---|---|---|
| Lighthouse mobile | 96 median | ≥ 95, no regression |
| Lighthouse desktop | 100 | ≥ 95 |
| LCP | ~2.7s mobile / 0.6s desktop | must not increase |
| CLS | 0.000 | < 0.1 |
| Shipped JS delta | — | ≤ 6 KB gzipped (scrubber only) |
| First frame | — | ≤ 30 KB, on the critical path |
| Full sequence | — | ≤ 700 KB desktop, ≤ 250 KB mobile, all post-`load` |

If the sequence cannot stream without hurting LCP, the frame count drops before
anything else does.

## 9. Mobile

Not a scaled-down desktop scene. A separate, shorter sequence: fewer frames,
smaller dimensions, art-directed for a tall viewport rather than cropped from a
wide one. The narrative keeps the same five beats; it simply spends fewer frames
on each. Text and navigation stay primary throughout.

## 10. Reduced motion

The sequence pins to a single chosen frame and no scroll listener is attached.
The composition still looks finished, because a single frame of it is a finished
image. Nothing else on the site animates beyond the existing single entrance per
section, which already has a hard stop.

## 11. Fallback

There is no WebGL at runtime, so there is no WebGL fallback to fail. With
JavaScript disabled the first frame is still in the HTML and the hero is
complete. On `Save-Data`, only the first frame is fetched.

## 12. Accessibility

Unchanged and non-negotiable: semantic landmarks, one `h1`, keyboard operability,
visible focus, skip link, meaningful alt text, zero axe violations. The sequence
is decorative and `aria-hidden`. **No information exists only inside the
visual** — every claim is real DOM text, which is also why SEO is unaffected.
Text is never placed over the image without a measured contrast check; the
existing geometric approach — text and visual occupy separate columns — is kept
where possible.

## 13. Risks

| Risk | Handling |
|---|---|
| Image sequence weight | Tiered resolutions, AVIF with WebP fallback, frame count is the first thing cut |
| Scroll scrubbing jank on low-end devices | Decode ahead by a small window; drop to every second frame under measured jank |
| The scene reads as generic | It is staged from the actual pipeline; if it still reads as generic after two design passes, that is a kill criterion |
| Scope | The content architecture, data contract and verification harness are untouched, so a failed visual direction does not put the working site at risk |

## 14. What is explicitly kept

The data contract, the Truth Ledger discipline, the resume pipeline, the design
tokens, the contrast suite, the secret scanner, the verification harness, the
architecture diagram, the real Resume Analyzer screenshot, and every accessibility
and SEO guarantee.

**Stopping here for your decision on Option A versus Option B.**

---

## C1 — Asset production: decision, with proof

**Decision: B1 for the shipped frames, B2 spec delivered so they are swappable,
B3 typographic discipline as the load-bearing design.**

Not a runtime WebGL scene. The shipped artifact is images. Three.js is a
build-time tool that never reaches the browser, which is what Option B specified
and what was approved.

### What is actually available here

```
Blender            not installed, not on PATH
bpy                not importable
moderngl           not importable
trimesh            not importable
Pillow 11.3.0      available
numpy 2.2.6        available
headless Chrome    available, with SwiftShader software GL
```

Blender-based authoring is out. So B1 rests on whether headless Chrome plus
three.js can render frames of adequate quality offline. That is a claim, so it
was tested rather than asserted.

### The test

`scripts/render-frames.mjs` bundles a scene, runs it in headless Chrome under
SwiftShader, and writes one image per frame. It uses the affordances a real-time
budget forbids, because nothing here runs on a visitor's device:

- 2× supersampling (2400×1500 internal for a 1200×750 output)
- 2048px shadow maps, PCF soft shadows
- Image-based lighting via `PMREMGenerator` + `RoomEnvironment`
- `MeshPhysicalMaterial` with clearcoat and sheen
- ACES filmic tone mapping, sRGB output

**Result: 5 frames rendered in 44.9s — roughly 9s per frame.** 15 draw calls,
170 triangles. Output is clean, anti-aliased, correctly tone-mapped WebP.

At that rate a 60-frame desktop sequence is about 9 minutes of build time, and a
30-frame mobile sequence about 4.5. Both run once, offline.

**So B1 is real. The renderer works.**

### The honest part

Two art-direction passes in, the frames are **not yet good enough to ship**.

Pass 1 was blown out — the paper clipped to pure white, the composition was dead
centre and symmetric, and the cast shadows were invisible.

Pass 2 fixed the exposure and the composition, and introduced a new problem: the
rim light now dumps a large blue pool onto the floor plane, the slabs still read
as *stacked plates* rather than *a document fracturing into chunks*, and the key
light angle throws the cast shadows out of frame entirely.

That is a real finding and it sets expectations correctly: **the renderer is not
the hard part; the art direction is.** Getting from "technically correct render"
to "premium, deliberate, unmistakably art-directed" is several more passes, and
it is the part where this could still fail.

### Consequences for the architecture

Three things follow, and they are what make this decision safe rather than a bet:

1. **The frame source is swappable.** The scroll system reads a **manifest**
   (`public/media/sequence/<beat>/manifest.json`: frame count, dimensions,
   file naming, the reduced-motion still). It has no knowledge of how the frames
   were produced. Replacing my renders with Blender renders — yours or
   commissioned — is dropping files in a directory and updating one JSON file.
   No component changes. The B2 spec below is written against that contract.

2. **Typography carries the design.** Per §C10, the composition, type scale and
   hierarchy are built so the site is excellent with the sequence removed
   entirely. The frames are an enhancement layered onto a design that already
   stands. If the art direction never reaches the bar, the sequence degrades to
   a small number of strong static compositions and the site is still good.

3. **A pre-committed kill criterion.** Round 2's V9 carries forward: if after
   the agreed iteration budget the frames still read as generic, the sequence is
   cut down to stills rather than shipped mediocre, and that is reported plainly
   as the outcome.

### B2 production spec — for rendered frames from any source

If you render or commission frames, this is what the system will consume. Match
it and they drop straight in.

| Field | Desktop | Mobile |
|---|---|---|
| Frame count | ≤ 60 per beat | ≤ 30 per beat |
| Longest edge | 1600px | 800px |
| Aspect | 16:10 | 4:5 (vertical composition, not a crop) |
| Format | AVIF primary, WebP fallback | same |
| Per-frame budget | ~25 KB | ~15 KB |
| Total budget | ≤ 2.0 MB all sequences | ≤ 700 KB |
| Naming | `frame-000.avif` … zero-padded to 3 | same |
| Colour | sRGB, background `#0B0C0E` baked in | same |
| Still frame | one nominated index for reduced motion — chosen for composition, not frame 0 | same |
| Manifest | `manifest.json` with `count`, `width`, `height`, `still`, `ext` | same |

Camera and beat definitions, so a renderer in any tool matches the narrative:

```
BEAT 1  DOCUMENT          one intact sheet at rest, key light raking across it
BEAT 2  CHUNKS            the sheet separates into overlapping slabs
BEAT 3  EMBEDDINGS        slabs contract into small dense tokens on a lattice
BEAT 4  SEMANTIC SEARCH   a query object enters; neighbours brighten by distance
BEAT 5  ANSWER            the nearest few lift out and align, with citation marks
```

Material language, fixed across all beats so the sequence reads as one place:
matte paper, dark brushed metal floor, a single warm key, one cool rim, one
accent emissive. No neon, no particles, no grid floor, no volumetrics.

### What I need from you

Nothing blocking — I can proceed on B1 now. But if you have or can commission
Blender renders to the spec above, they will land better than mine will, and the
system is being built so that swap costs nothing.

---

# V2 — implementation record

Built 2026-08-28. What follows is what shipped, including where it differs from
the proposal and why.

## Technology, and what reaches the visitor

| | |
|---|---|
| Shipped to the browser | HTML, CSS, ~4 KB of sequence JavaScript, and WebP frames |
| **Runtime 3D** | **none** — no three.js, no R3F, no WebGL context, no GPU work |
| three.js | a **devDependency**, used only by `scripts/render-frames.mjs` at build time |
| Production dependencies | `next`, `react`, `react-dom` — unchanged |

## The scene

`scripts/scenes/hero-beat.mjs`, rendered offline. A single printed page rests on
a dark studio table; horizontal bands lift off it carrying their own text,
because their UVs are windows onto one page texture. One band is picked out by a
cool accent — the retrieved chunk.

Deliberately **one page, not a stack**: three art passes proved stacked blank
sheets read as plates, and blank paper carries no information. The page's content
is drawn procedurally as abstracted rules — no words, so nothing is invented.

Materials are matte paper, a semi-reflective dark table, and a seamless dark
surround. One warm key with a 2048px soft shadow map, a dim warm fill, and a
weak cool kicker. ACES tone mapping, image-based lighting, 2× supersampling —
all affordable because it runs once on a build machine.

## Scroll architecture

`src/lib/sequence.ts` — manifest-driven, canvas-based.

- Frames decode with `createImageBitmap`, **off the main thread**, into one
  canvas rather than sixty `<img>` tags
- Scroll position is **read, never written** — no wheel handler, no `scrollTo`,
  no pinning library, so native momentum, trackpad, keyboard and touch are
  untouched
- Paints coalesce to one per animation frame
- Frames beyond the still load **on the first scroll**: a reader who never
  scrolls never requests them
- A missing frame falls back to the nearest decoded neighbour, so a dropped
  request costs smoothness and never correctness

## The frame source is swappable

`public/media/hero/<variant>/manifest.json` carries count, dimensions, file
pattern and which frame is the still. Nothing in the code knows how the frames
were made.

Replacing these with Blender or C4D renders is: write files, edit one JSON. No
component changes. The production spec is in the C1 section above.

## Where it differs from the proposal

**Mobile has no cinematic raster.** The plan was a shorter vertical sequence;
that was built, measured and cut. Seven attempts are recorded in
`VERIFICATION.md` §24.4 — every one either missed the 95 performance gate or made
the image the largest contentful paint, which C6 forbids. The finding
generalises: a full-bleed image in a mobile hero always beats a heading on
painted area.

Mobile is therefore typography, the dark plate and a CSS gradient, scoring 95
with the heading as LCP. Desktop keeps the full 36-frame scrub and scores 100.

The 18-frame mobile sequence remains rendered and in the repository. If the
frame source is later replaced with something lighter, or the site moves behind
a CDN, re-enabling it is one condition in `HeroSequence`.

**The hero is dark in both themes.** The frames are lit for a dark studio with
that background baked in. A light-theme variant would double asset weight and
render time for a composition that was lit for darkness. The hero carries the
dark palette locally via `.hero-cinema`; the rest of the site follows the
reader's theme.

## Colour and type

Accent changed from `#1A56DB`, which is default UI blue.

| Token | Dark | Light |
|---|---|---|
| bg | `#0B0C0E` | `#FFFFFF` |
| surface | `#131417` | `#F7F8F9` |
| surface-raised | `#1A1C20` | `#EFF1F3` |
| border (decorative) | `#292C33` | `#D9DDE2` |
| border-strong (interactive) | `#646973` | `#848B96` |
| text | `#E9EAEC` | `#111317` |
| text-secondary | `#A2A7B0` | `#4A5058` |
| text-muted | `#868B94` | `#626871` |
| **accent** | **`#93AFEF`** | **`#3A55BE`** |
| accent-quiet | `#1B2233` | `#ECEFFB` |

**Why this hue:** it is the colour of the light falling on the retrieved band in
the rendered frames — a periwinkle rather than a saturated interface blue — so
the type and the image share one light source instead of merely coordinating.

Measured: **38 of 38 token pairs pass**, accent at 8.96:1 on dark and 6.52:1 on
light. Two typefaces, Inter and JetBrains Mono, mono reserved for stack chips,
metrics, stage labels and section eyebrows.

Type scale, mobile → ≥640px: display 36→56, h1 30→40, h2 24→30, h3 18→20,
body-lg 17→18, body 16, small 14, micro 12. Prose measure 68ch, hero headline
44ch.

## What the sequence is allowed to say

Three labels — DOCUMENT, CHUNKS, RETRIEVED — because those are the three things
the frames actually show. Embeddings, hybrid search, reranking and generation are
**not** depicted, and so are not labelled; they live in the RAG project's
architecture diagram where every box maps to a file. Ledger §10.4.

---

# V3 hero — implementation record

Built 2026-09-01, replacing the V2 hero sequence. What follows is what shipped
and why it differs from what came before.

## Why it was rebuilt

The brief carried a kill criterion: if the rendered 3D still looks like stacked
plates, floating cards, particles, grids or generic AI visuals after the
art-direction passes, do not ship it. Opened in a browser, the V2 hero looked
like stacked plates.

The cause was not lighting, and not the renderer. It was the subject. V2 showed
one printed page separating into seven horizontal bands, and **a flat sheet is a
card however it is lit** — seven of them is a deck. Two attempts to fix it
within that subject confirmed the diagnosis rather than solving it: adding real
thickness, a 47° lens and a camera arc produced correct perspective on pages
that now floated in a void, which is the same failure one step along.

## What is on screen now

`scripts/scenes/hero-beat-v5.mjs`, rendered offline.

A solid block of paper resting on a table — mass, a striated cut edge, a contact
shadow, and a silhouette that changes as the camera moves. One sheet slides out
of the middle of it and is lit. On that sheet two bands are washed in the accent:
the retrieved chunk, and the tail of the one before it, overlapping its top edge.

That is also the truer picture of the system. Retrieval does not take a page
apart; it finds one passage inside a corpus. The image now says that.

## The block is one box, not a ream of meshes

The first version of this scene modelled 140 individual sheets. It was
unshippable: stacked opaque quads overdraw catastrophically under a software
rasteriser, every one of them evaluating a soft-shadow lookup, and a single
frame exceeded the renderer's 60-second timeout.

The interior sheets are invisible in any case — all that is ever seen is the top
sheet and the cut edges. So the block is one box whose side faces carry a
procedural lamination texture, with seven real sheets riding on top to break the
silhouette, and the retrieved sheet modelled for real. 31 draw calls, ~13s per
frame, and indistinguishable from the version that could not render.

## Technology, unchanged

| | |
|---|---|
| Shipped to the browser | HTML, CSS, ~4 KB of sequence JavaScript, and WebP frames |
| **Runtime 3D** | **none** — no three.js, no R3F, no WebGL context, no GPU work |
| three.js | a **devDependency**, used only at build time |
| Production dependencies | `next`, `react`, `react-dom` — unchanged |

The manifest contract is unchanged, so the frame source is still swappable:
`public/media/hero/<variant>/manifest.json` carries count, dimensions, file
pattern and which frame is the still. Replacing these with Blender or C4D
renders is still write files, edit one JSON.

## Composition, and why the scrim changed

The canvas is full-bleed behind the hero, so the subject has to live in the right
half. Measured in the browser, the block's left edge sits at 44% of frame width
and the longest hero line ends at 47%. That 3% sliver is why the scrim was
strengthened from `opaque → 26%, 0.55 → 48%, clear → 66%` to `opaque → 38%,
0.7 → 52%, clear → 70%`.

## Labels

The stage labels changed with the subject, because the old ones described a page
splitting into bands and that is no longer what is on screen. They are now
Corpus, Retrieved, Chunk. Every one is traceable — ledger §11.2 — and the
overlap the third label mentions is now *drawn* rather than only asserted.

## Frame count and weight

44 frames, 1.6 MB, against a cap of 2048 KB. The count rose from 36 because the
camera travels much further than it did; the extra frames are what keep the
parallax smooth.

## What did not change

Mobile still carries no cinematic raster, for the reasons measured in
`VERIFICATION.md` §24.4 — that decision was not revisited and the mobile payload
is byte-for-byte identical before and after this work (§25.4). The portrait
frames were regenerated for parity only; they are never requested, and their
composition would need work before mobile could be re-enabled.

---

# V3 — Full redesign proposal

**Status: PROPOSAL. Nothing in this section is implemented. Awaiting approval.**

Written 2026-09-01 after inspecting the live site at 360, 390, 768, 1024, 1440
and 1920. Screenshots referenced here are in `verification/shots/` and the
session audit set.

---

## 1. What is wrong with the current UI

Measured and observed, not guessed.

### 1.1 The site is two different products bolted together

The hero is a locked dark cinematic plate. Everything below it follows the
reader's theme, which by default is white. The seam is a hard horizontal line at
the end of the hero: black above, stark white below. Nothing carries across —
not a colour, not a texture, not a lighting direction. A visitor experiences a
premium film, then a documentation page.

This is the single largest problem. It is why the site reads as competent rather
than expensive.

### 1.2 Every section is the same card

Eight projects, all in bordered boxes of near-identical weight. Skills sits on a
bare white field. Python fundamentals is a card containing a table. The eye gets
no hierarchy, so nothing is emphasised — including the flagship.

### 1.3 The flagship is not treated as a flagship

`AARIZ AI` uses exactly the same grammar as the Resume Analyzer directly beneath
it: bordered card, image left, text right, chip row, bullet list, disclosure,
buttons. The most important thing on the site is visually interchangeable with
the second most important thing.

### 1.4 Typographic hierarchy is flat

Every section heading — Featured work, Machine learning & web projects, Python
fundamentals, Skills, About, Education, Contact — renders at the same size, and
that size is small against a 1440 viewport. There is no display tier. The name
in the hero is the only large type on the entire page.

### 1.5 The accent is not being used

Tokens define a periwinkle accent, but the primary buttons render in a saturated
default blue that does not match it, and the RAG diagram uses a third blue. Three
blues, none of them owned.

### 1.6 The RAG architecture diagram looks like a tool export

Grey rounded rectangles, thin arrows, a dashed annotation box, on a light grey
panel. It is accurate and it is legible, and it looks like a Lucidchart file
pasted into the page.

### 1.7 The hero ends on nothing

At the end of the scroll the block has travelled up and right and the frame is
roughly 250px of pure black before the section boundary. The sequence has no
resolution — it simply runs out.

### 1.8 Mobile labels describe a picture that is not there

`01 CORPUS / 02 RETRIEVED / 03 CHUNK` render on mobile, where there is no
visual. They are captions for an absent image.

### 1.9 Chips, bullets and disclosures are generic

Grey pill chips, disc bullets, a chevron disclosure. All default component
shapes. Nothing here is designed.

---

## 2. What is wrong with the current 3D

### 2.1 It is not a story — it is a state change

Five beats were asked for. Two exist: a block, and a sheet sliding out of it.
There is no extraction, no context, and no answer. The middle of the scroll is
the camera moving, not the subject doing anything.

### 2.2 It resolves into emptiness

See 1.7. A cinematic sequence whose last frame is an empty black rectangle has
no ending.

### 2.3 The subject says "paper", not "intelligence"

A ream of A4 is a truthful picture of a corpus and a completely inert one. It
communicates *documents*. Nothing in the frame communicates that anything
intelligent happened to them. A recruiter sees a stack of printer paper.

### 2.4 The composition is unbalanced

The subject occupies roughly the middle third, drifting right, with large dead
black areas left and below. At mid-scroll the block's lit edge runs under the
stage-label text, which is a contrast risk as well as a compositional one.

### 2.5 It is still a variation on the rejected idea

v2 was a page splitting into bands. v3 was the same with thickness. v5 is a
stack of the same sheets. Three attempts, one underlying idea: *paper coming
apart*. That idea keeps producing plates because separated flat sheets are
plates. It needs abandoning, not refining.

---

## 3. The new 3D concept — "Read"

**One sheet of paper. It never moves, never separates, never floats. What moves
is the light.**

A single printed A4 sheet lies on a dark studio desk, shot from a low
three-quarter angle with a 45mm-equivalent lens. Warm key from upper left, real
contact shadow, faint paper curl at one corner, visible fibre tooth. It is
unmistakably a physical object on a physical surface.

Across the scroll, a narrow band of light travels down the page and then narrows
onto a single paragraph. The rest of the page falls away into darkness.

**The light is the machine reading.** That is the whole idea, and it is the one
thing a stack of paper could never say.

### Why this concept and not another

| Requirement | How this satisfies it |
|---|---|
| No floating cards, plates, particles, grids | Nothing ever leaves the desk. There is one object and it is at rest throughout |
| Realistic, physical, cinematic | A lit sheet of paper is the most photographable subject there is. Contact shadow and paper grain do the work |
| Must mean something | A beam narrowing to one paragraph *is* retrieval. No caption needed |
| Must not dominate the UI | It is dark, still, and low-contrast on the left where the type sits. It cannot compete with a 56px name |
| Must be cheap | One sheet, one desk, three lights. Fewer draw calls than the current scene |
| Beginning, middle, end | The light arrives, searches, finds, and hands off. See below |

### The five beats

| Beat | Label | What is physically happening |
|---|---|---|
| 1 | **DOCUMENT** | The sheet, evenly and warmly lit, whole. Camera wide. Nothing has happened yet |
| 2 | **EXTRACTION** | A soft horizontal band of light sweeps down the page. Where it passes, faint bracket marks appear in the margin, delimiting sections — a reader's pencil marks, printed on the paper, not floating above it |
| 3 | **RETRIEVAL** | The ambient light dims. One bracketed paragraph stays lit by a narrowed beam. The rest of the page falls to near-black. The paragraph is not moved, lifted or extracted — it is simply the only thing still lit |
| 4 | **CONTEXT** | Camera pushes in. Shallow depth of field isolates the lit paragraph; the paragraphs above and below stay just visible at the edge of the beam — that is the chunk overlap, shown rather than stated. Thin measure marks rule off the lit band, scientific-visualisation style |
| 5 | **ANSWER** | The beam's light spills to the right of the frame, and the answer resolves there as **real DOM text**, not 3D. The 3D hands off to the interface |

Beat 5 is deliberately not modelled. A rendered "answer panel" would be a
floating card, which is the banned shape. Letting the sequence resolve into
actual HTML is more honest, sharper at every DPI, readable by a screen reader,
selectable, and free.

### Realism specification

- Sheet: 210×297 proportion, ~0.1mm thickness modelled as real geometry with a
  lit cut edge, one corner lifted ~4mm with a soft crease
- Paper: micro-fibre normal detail, roughness ~0.9, sheen for the fibre catch,
  no specular hotspot
- Desk: matte, roughness ~0.85, metalness ~0.05 — it exists to take the contact
  shadow, not to reflect
- Key: 3200K, soft, upper left, 2048px shadow map, contact shadow tight at the
  paper edge and softening with distance
- Beam: a spot with a soft falloff, never a visible volumetric cone — no god
  rays, no bloom
- Depth of field introduced only in beats 4 and 5, focal plane on the lit band
- No emissive paper. The paper is lit; it does not glow

### Explicit non-goals

No particles. No grid. No wireframe. No hologram. No neon. No blue rim light. No
lens flare. No floating UI. No object without contact shadow. No intersecting
geometry.

---

## 4. Colour — moving off blue entirely

The brief says avoid "blue light everywhere". The current accent is periwinkle
and the current buttons are default blue. Both go.

**The accent becomes warm amber**, taken from the key light falling on paper.
Every AI portfolio on the internet is blue or violet. None of them are the colour
of a desk lamp. It is also the colour already in the render, so type and image
share one light source rather than merely coordinating.

| Token | Dark (default) | Light |
|---|---|---|
| bg | `#0C0C0D` | `#FBFAF8` |
| surface | `#141416` | `#F2F0EC` |
| surface-raised | `#1C1C1F` | `#E9E6E0` |
| border | `#26262A` | `#DDD9D2` |
| border-strong | `#5F5F68` | `#8A857C` |
| text | `#EDE9E1` (warm off-white) | `#16161A` |
| text-secondary | `#A8A49B` | `#4A4842` |
| text-muted | `#8A867E` | `#63605A` |
| **accent** | **`#E0A96D`** | **`#9A5B18`** |
| accent-quiet | `#2A2118` | `#F7EDE0` |

Contrast to be re-verified across all pairs before implementation is called
done; the light-theme accent is darkened specifically to clear 4.5:1 on the
light surface.

**Dark becomes the default theme**, so the site stops fracturing at the hero
boundary. Light theme remains fully supported and toggleable.

---

## 5. Typography

Current: Inter for everything, JetBrains Mono for labels. Competent, anonymous.

Proposed three-tier system:

| Tier | Face | Used for |
|---|---|---|
| Display | **Instrument Serif** | The name, section numbers, the one-line positioning statement |
| Body | **Inter** | All prose, project copy, navigation |
| Mono | **JetBrains Mono** | Eyebrows, stage labels, stack chips, metrics, section indices |

One editorial serif against a neutral grotesque and a mono is the standard
premium-editorial pairing, and it is what separates a designed page from a
Tailwind default. The serif appears perhaps six times on the whole site — it is a
punctuation mark, not a body face.

Scale, mobile → ≥1024px:

| Role | Mobile | Desktop |
|---|---|---|
| Hero name (serif) | 52 | 104 |
| Hero statement | 22 | 32 |
| Section heading (serif) | 34 | 60 |
| Project title | 22 | 30 |
| Body large | 17 | 19 |
| Body | 16 | 16 |
| Mono label | 11 | 12 |

Measure capped at 66ch for prose, 38ch for the hero statement.

---

## 6. Layout system — four grammars, not one

The cure for "everything is a card" is to give each tier its own composition.

**Hero** — asymmetric. Type occupies the left 46% at desktop; the sheet occupies
the right, bleeding off the right edge. Never overlapping.

**Flagship (AARIZ AI)** — full-bleed editorial spread on its own dark ground,
no border, no card. Title set in serif at 60px. A wide architecture visual runs
edge to edge beneath a two-column text block. Verified metrics set as large mono
figures with small captions, in a row, on rules.

**Standard projects (Resume Analyzer, Sales, Heart Stroke…)** — alternating
asymmetric rows. Image left/text right, then reversed. Hairline rule between
rows. No boxes.

**Compact projects (Iris, Wine, Travel Planner)** — a typographic index: a
three-column table of title / stack / link, ruled, no cards at all. This is where
restraint reads as confidence.

**Python fundamentals** — a plain ruled list. Four rows. No panel.

**Skills** — keep the six-group structure, which is already right. Restyle: mono
group headings in accent, larger gaps, hairline rules, and a hover state that
dims the other groups slightly.

---

## 7. Desktop composition (1440)

```
┌──────────────────────────────────────────────────────────────┐
│  Aariz Khan            WORK  SKILLS  ABOUT  CONTACT  [RESUME] │  sticky, hairline
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  AI / ML DEVELOPER            ·mono, accent·                 │
│                                                              │
│  Aariz                        ·serif, 104px·                 │
│                                                              │
│  I build intelligent systems         ┌ ─ ─ ─ ─ ─ ─ ─ ─ ┐     │
│  that turn data into                  the lit sheet,         │
│  useful answers.              ·32px·  bleeding off the right │
│                                       edge, dark on the left │
│  B.Tech CSE (AIML) · RAG, NLP,        where the type sits    │
│  and full-stack AI systems.   ·16px·                         │
│                                      └ ─ ─ ─ ─ ─ ─ ─ ─ ┘     │
│  [EXPLORE PROJECTS]  [VIEW RESUME]                           │
│   LIVE RAG DEMO ↗             ·tertiary, text only·          │
│                                                              │
│  ──────────────────────────────────────────                  │
│  01 DOCUMENT   02 EXTRACTION   03 RETRIEVAL  …               │
│  ·mono, horizontal, active beat in accent·                   │
└──────────────────────────────────────────────────────────────┘
```

Stage labels move from a stacked left-hand list to a single horizontal row along
the bottom, so they read as a filmstrip timeline rather than a caption block, and
they stop competing with the CTAs.

---

## 8. Mobile composition (390)

Not the desktop shrunk. A different layout.

```
┌────────────────────────┐
│ Aariz Khan        ☰    │
├────────────────────────┤
│                        │
│  AI / ML DEVELOPER     │  mono, accent
│                        │
│  Aariz                 │  serif 52px
│                        │
│  I build intelligent   │  22px
│  systems that turn     │
│  data into useful      │
│  answers.              │
│                        │
│  B.Tech CSE (AIML)     │  14px muted
│                        │
│  [EXPLORE PROJECTS]    │  full width, 48px
│  [VIEW RESUME]         │
│  LIVE RAG DEMO ↗       │
│                        │
│  ┌──────────────────┐  │  bounded cinematic still
│  │  the lit sheet   │  │  16:10, ~34% of viewport
│  └──────────────────┘  │  height, explicit dims
│  01 DOCUMENT           │  labels now describe a
│  …                     │  picture that exists
└────────────────────────┘
```

The still is **bounded and below the fold-critical content**, not a full-bleed
background. That is the specific change that lets a raster exist on mobile at all
— seven previous attempts failed because a full-bleed hero image always wins the
LCP contest against a heading on painted area.

**This is a measurement, not a promise.** If the bounded still still takes LCP or
drops mobile below the gate, it is removed and mobile ships type-only, exactly as
now. That decision point is recorded before the work starts rather than argued
afterwards.

---

## 9. How the RAG flagship will be presented

Two layers, so a recruiter and an interviewer each get what they need.

**Layer 1 — the story, always visible.** Five terms on one horizontal rule,
connected by hairlines, set in mono:

```
DOCUMENT ──── FRAGMENTS ──── RETRIEVAL ──── CONTEXT ──── ANSWER
```

Under each, three or four words of plain English. No boxes, no arrows-with-
arrowheads, no dashed annotation panels. A recruiter reads this in four seconds
and understands the project.

**Layer 2 — the engineering, on demand.** A disclosure headed *"How each stage
is implemented"* expands to the ten verified stages with the file that implements
each, the RRF formula, the pgvector operator, the chunk constants. Every row
traceable to `TRUTH-LEDGER.md` §10.2.

Composition: full-bleed, no card. Serif title at 60px. Below it, the story rail.
Below that, two columns — description and stack left, verified facts right.
Verified facts as large mono figures:

```
10          14           768         COMPLETED
source      extensions   embedding   status
types                    dimensions
```

Actions: `VIEW SOURCE` and `LIVE DEMO ↗` → `https://aariz-ai-three.vercel.app`.
Status **COMPLETED**, no badge chrome, just the word set in accent mono.

Note: the site currently claims *nine* document formats. The repository supports
**ten** across fourteen extensions. This redesign corrects that.

---

## 10. Resume Analyzer — a different visual language

Deliberately not the RAG treatment. Where RAG gets an editorial spread, this gets
a **product frame**: the real Streamlit screenshot in a restrained device frame,
annotated with three callout rules pointing at actual features — upload, match
score, skill gap.

No invented dashboard, no fabricated numbers, no fake charts. If a number is not
in the repository it does not appear. The visual story — PDF → extraction →
embeddings → similarity → gap — runs as a caption rail beneath the screenshot in
mono, the same rail grammar as the flagship but rendered smaller and quieter, so
the two projects rhyme without competing.

---

## 11. Motion

Every animation must answer "what does this help the user understand?".

| Motion | Justification | Kept? |
|---|---|---|
| Hero scroll sequence | It is the argument of the whole page | Yes |
| Section entrance reveal | Establishes reading order | Yes, 200ms, 8px, once |
| CTA magnetic pull | Signals the primary action | Yes, ≤4px, desktop pointer only |
| Project row parallax on image | Gives depth, reinforces the editorial layout | Yes, ≤12px |
| Stage label activation | Tells you where you are in the sequence | Yes |
| Text scramble / typewriter | Explains nothing | No |
| Cursor follower | Explains nothing | No |
| Page transitions | Costs LCP, explains nothing | No |
| Card tilt on hover | There are no cards | No |

All motion collapses to nothing under `prefers-reduced-motion`.

---

## 12. Scroll and sequence budget

- Desktop hero: **2.4 viewport heights** (ceiling 2.5)
- Mobile hero: **1.0** — no scrub, so no extra distance at all (ceiling 1.5)
- Scroll is read, never written. No wheel handler, no `scrollTo`, no pinning
  library. Native momentum, trackpad, keyboard and touch untouched
- `EXPLORE PROJECTS` is an anchor to `#work` and works instantly at scroll 0
  without traversing the sequence

Frames: 48 desktop at 1600×1000, WebP q80. Budget **≤1.6 MB** desktop total.
Mobile: one still, ≤40 KB.

---

## 13. Accessibility

- Every stage label and its explanatory sentence is real DOM text; the canvas is
  `aria-hidden` and never focusable
- The page makes complete sense with all animation disabled and with images off
- Focus visible on every interactive element, 2px accent ring at 3:1 minimum
- Tap targets ≥44px
- All token pairs re-verified for contrast; interactive borders ≥3:1, text ≥4.5:1
- `h1` exactly once; no skipped heading levels
- Serif display face checked for legibility at 52px on a 360px screen before it
  ships

---

## 14. Performance budget

| Gate | Target |
|---|---|
| Lighthouse performance, desktop | ≥95 |
| Lighthouse performance, mobile | ≥95 where achievable; regressions explained with measurements |
| Accessibility / Best Practices / SEO | 100 |
| LCP element | **the hero heading**, both breakpoints — non-negotiable |
| CLS | <0.1 |
| Horizontal overflow | 0 at all six widths |
| Shipped runtime 3D | **none** — three.js stays a devDependency |
| Production dependencies | `next`, `react`, `react-dom` |

The display serif is one additional font family. It is subset to latin, loaded
via `next/font` with `display: swap`, and used for roughly six strings. If it
costs more than 3 points of mobile performance it is cut and the name is set in
Inter at a heavier weight.

---

## 15. Fallback strategy

| Condition | What is shown |
|---|---|
| `prefers-reduced-motion: reduce` | The strongest single frame — beat 3, the lit paragraph. No scroll listener attached, no sequence constructed |
| `Save-Data` / 2G | Same single frame |
| No JavaScript | Same frame painted as a CSS background; all hero text, both CTAs and every stage label server-rendered |
| Narrow viewport | Bounded still, or type-only if measurement demands it (§8) |
| Frame fetch fails | Nearest decoded neighbour; a dropped request costs smoothness, never correctness |

---

## 16. Sequenced delivery

1. Colour tokens, typography, theme default → verify contrast on all pairs
2. Layout grammars: flagship spread, alternating rows, compact index
3. Skills, About, Education, Contact restyle
4. New 3D scene: art passes at low resolution until beat 3 is right
5. Full render, install, wire manifest
6. Mobile composition and the bounded-still measurement
7. Full verification sweep and screenshot review at all six widths
8. Documentation: ledger, verification, review

Each of 1–3 is independently shippable and independently reversible. The 3D is
step 4 deliberately: if the typography and layout are not excellent without it,
no render will save them.

---

## 17. V3 art-direction refinement — approved 2026-09-01

The "Read" concept is approved with one correction that governs everything else:

> **The paper is only the physical metaphor. The result must never feel like a
> stationery portfolio.** The visual language has to say *an AI system is reading
> this information* — not *this is a website about paper*.

### 17.1 Computational cues — integrated, not overlaid

Subtle marks appear in and on the sheet as the light passes. They belong to the
document's own surface: printed, embossed, or cast by the beam. They are never a
HUD floating in front of the scene.

| Cue | Where it lives | When |
|---|---|---|
| Selection brackets | Printed in the page margin, ink on paper | Beat 2, as the sweep passes |
| Chunk index marks | Small mono numerals beside each bracket, `§01`–`§06` | Beat 2 |
| Coordinate metadata | A single faint line of mono at the sheet's foot — token span and offset | Beat 3 |
| Passage highlight | A soft amber wash on the retrieved lines, sitting *in* the paper | Beat 3 |
| Measure rules | Thin ticks ruling off the lit band, like a caliper | Beat 4 |
| Similarity figure | One small mono number beside the lit band | Beat 4 |

Density is deliberately low. The cues should be almost invisible until noticed —
a reader who never looks closely sees a beautifully lit document; a reader who
does sees a machine's working.

**Typographic transition.** The page's printed body is rendered as serif-like
rules. The computational marks are mono. As the sequence advances, the marks
near the lit band shift from document typography toward computational
typography — that shift is the visual argument that information has become data.

### 17.2 Explicitly forbidden

Neon HUD · floating holograms · particle clouds · cyberpunk interfaces · glowing
grids · generic AI symbols · binary digits · arrow spaghetti · floating cards ·
giant 3D text.

### 17.3 The final state must resolve, never empty

The sequence previously ended on ~250px of black. The new ending holds:

- the name and role, still legible
- both CTAs, still reachable
- **a visual remnant of the reading** — the sheet at rest in shadow with the
  retrieved passage still faintly warm, and the answer panel settled beside it

The last frame is a composition, not an exit.

### 17.4 The DOM answer hand-off

The most polished moment on the site. The beam's spill establishes a warm pool
on the right; the answer resolves *there* as real DOM text — a short grounded
sentence with its source line beneath it, set in the site's own type. The 3D
light and the HTML share one lighting direction so the hand-off reads as one
continuous image rather than a layer appearing.

Timing: the panel's opacity and 8px rise are driven by the same scroll progress
that drives the sequence, so it is scrubbable in both directions and costs no
timer.

### 17.5 Review gate

Before this is called finished, these eight are rendered and inspected: hero at
rest · extraction · retrieval · context · answer · final resting state · 1440
full page · 390 full page. Any frame reading as cards, plates, floating
rectangles, generic 3D, a stationery advertisement, or cyberpunk UI is rejected
and redone.

**And the standing test: the UI must be excellent with the 3D removed entirely.**
