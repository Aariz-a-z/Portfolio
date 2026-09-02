# VERIFICATION.md

Date: 2026-08-27
Everything below was executed. Output is pasted as produced. Where something
failed, it is recorded with the fix and the re-run result.

Environment: Windows 11 · Node v22.15.0 · npm 10.9.2 · Next.js 16.3.1 ·
React 19.2.8 · Tailwind CSS 4 · TypeScript 5.
Served with `next start` on `http://localhost:4321`. Browser automation and
screenshots use a headless Chrome driven over the DevTools Protocol by
`scripts/cdp.mjs`, which adds no dependency.

---

## 1. Build

```
$ npm run build

  ┌─────────────────────────────────────────────────────────────────┐
  │  SITE_URL is still a placeholder.                               │
  │  Canonical URL, OG/Twitter tags, sitemap.xml, robots.txt and    │
  │  JSON-LD will all point at TODO_FINAL_DOMAIN.                   │
  │  Set it in src/data/site.ts before deploying to production.     │
  └─────────────────────────────────────────────────────────────────┘
✓ Running next.config.ts took 148ms
  Creating an optimized production build ...
✓ Compiled successfully in 12.1s
  Running TypeScript ...
  Finished TypeScript in 5.6s ...
✓ Generating static pages using 3 workers (9/9) in 1297ms

Route (app)
┌ ○ /
├ ○ /_not-found
├ ○ /apple-icon.png
├ ○ /icon.svg
├ ○ /opengraph-image
├ ○ /resume
├ ○ /robots.txt
└ ○ /sitemap.xml

○  (Static)  prerendered as static content

exit=0
```

**PASS.** Every route is prerendered as static content. The `SITE_URL` warning is
the intended build-time warning from decision 8, not an error — it fires because
the final domain has not been supplied, and it does not fail the build.

Client JavaScript, all chunks, gzipped: **188,885 bytes (184 KB)**, of which
3,510 bytes are the hero scene — see §17.

## 2. Typecheck

```
$ npm run typecheck
> next typegen && tsc --noEmit

Generating route types...
✓ Types generated successfully
exit=0
```

**PASS.** No errors. `tsconfig.json` runs with `strict`, `noUnusedLocals`,
`noUnusedParameters` and `noFallthroughCasesInSwitch` enabled. There is no `any`
in the codebase.

## 3. Lint

```
$ npx eslint .
exit=0
```

**PASS**, with two real errors found and fixed on the way there.

**Failure 1 — ESLint could not run at all.**

```
TypeError: Converting circular structure to JSON
    at JSON.stringify (<anonymous>)
    at .../@eslint/eslintrc/lib/shared/config-validator.js:308:45
```

Cause: `eslint-config-next` 16 ships real flat configs, and routing them back
through `FlatCompat` made ESLint 9 fail while serialising the react plugin's
self-referential config object. Fix: import
`eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`
directly and drop `FlatCompat`.

**Failure 2 — two `react-hooks/set-state-in-effect` errors.**

```
src/components/layout/ThemeToggle.tsx:32:7  error  Avoid calling setState() directly within an effect
src/lib/motion.ts:31:7                      error  Avoid calling setState() directly within an effect
```

Both were genuine. The rule was not disabled.

- `ThemeToggle` mirrored the active theme into React state by reading it in an
  effect, which rendered the wrong icon for one frame and then corrected itself.
  Rewritten to hold no state at all: the document element already carries the
  theme, both icons are rendered, and CSS shows the one that matches. This also
  keeps the button correct if the system preference changes while the page is
  open.
- The reveal hook set state to drive an entrance that has no bearing on what
  React renders. Rewritten to drive the element's `data-animate` attribute
  directly.

## 4. Design token contrast

`scripts/check-contrast.mjs`, run before any UI was written.

**First run: FAIL — 7 of 32 pairs below target.**

```
  FAIL  text-muted on surface               4.33:1  (need 4.5)
  FAIL  text-muted on surface-raised        4.02:1  (need 4.5)
  FAIL  border on bg                        1.40:1  (need 3)
  FAIL  border on surface                   1.32:1  (need 3)
  ... and the same three border/muted failures in the light theme
```

Two different problems. `text-muted` was simply too low contrast in both themes
and was darkened (light) and lightened (dark) until it cleared 4.5:1 on every
surface it is used on.

The border failures were a design conflict rather than a bug. WCAG 1.4.11 applies
to visual information needed to identify UI components; a card is identified by
its content and surface, not its outline, so a cosmetic hairline carries no
information. Raising every border to 3:1 would have turned every hairline into a
hard rule — the opposite of the intended restraint. The token was therefore split:

- `border` — decorative separation, deliberately low contrast, not tested at 3:1
- `border-strong` — every interactive boundary, tested and passing at 3:1

**Final run: PASS — 38 pairs checked, 0 failures.**

```
  DARK
  PASS  text on bg                           16.26:1  (need 4.5)
  PASS  text-secondary on bg                  8.10:1  (need 4.5)
  PASS  text-muted on surface-raised          4.98:1  (need 4.5)
  PASS  accent on bg                          9.29:1  (need 4.5)
  PASS  status-ongoing on surface             8.44:1  (need 4.5)
  PASS  border-strong on surface              3.34:1  (need 3)
  PASS  accent on bg  (focus ring)            9.29:1  (need 3)

  LIGHT
  PASS  text on bg                           18.59:1  (need 4.5)
  PASS  text-secondary on bg                  8.14:1  (need 4.5)
  PASS  text-muted on surface-raised          4.96:1  (need 4.5)
  PASS  accent on bg                          6.18:1  (need 4.5)
  PASS  status-ongoing on surface             5.56:1  (need 4.5)
  PASS  border-strong on surface              3.23:1  (need 3)
  PASS  accent on surface (focus ring)        5.81:1  (need 3)

  RESULT: PASS — 38 pairs checked, 0 failures.
```

## 5. Accessibility — axe-core

axe-core 4.13.0 injected from `node_modules` and run against each route in a real
browser.

```
  /                              axe 4.13.0  violations: 0
  /resume                        axe 4.13.0  violations: 0
  /this-route-does-not-exist     axe 4.13.0  violations: 0
```

**PASS — zero violations on every page.**

Two accessibility defects were found by Lighthouse and fixed before this result:

- **`label-content-name-mismatch`.** Every "View source" button had
  `aria-label="View the <project> source on GitHub"`. The visible text
  "View source" is not contained in that accessible name, so a speech-input user
  saying what they can read would not match the control — WCAG 2.5.3. Relabelled
  to `"View source of <project> on GitHub"`, which begins with the visible text.
- **`errors-in-console`.** `/favicon.ico` returned 404. An `icon.svg` and a real
  multi-size `favicon.ico` were added.

### Document structure

```
  /
    h1=1  headings=53  skippedLevels=0  lang=en
    landmarks: header=1 nav=1 main=1 footer=1   skip-link=true   meta description=present
    images without alt=0   icon buttons without label=0
    title: Aariz Khan — AI/ML Engineer
  /resume
    h1=1  headings=4   skippedLevels=0  lang=en
    landmarks: header=1 nav=1 main=1 footer=1   skip-link=true   meta description=present
    images without alt=0   icon buttons without label=0
    title: Resume — Aariz Khan
```

**PASS.** One `h1` per page, no skipped heading levels, all four landmarks
present, skip link present, every image has alt text, every icon-only button has
an accessible name.

## 6. Links

```
  anchors on page: 27 (19 unique)
  dead/placeholder hrefs: 0
  in-page anchors resolving to a real element: 6/6
  external links missing rel=noopener noreferrer: 0
  demo buttons rendered (expected 0, no project has a demo URL): 0

    200  /                                  text/html; charset=utf-8
    200  /resume                            text/html; charset=utf-8
    200  /robots.txt                        text/plain
    200  /sitemap.xml                       application/xml
    200  /opengraph-image                   image/png
```

Every external destination was requested over the network:

```
  200  https://github.com/Aariz-a-z
  200  https://github.com/Aariz-a-z/aariz-ai
  200  https://github.com/Aariz-a-z/AI-RESUME-ANALYZER
  200  https://github.com/Aariz-a-z/Sales-forecasting
  200  https://github.com/Aariz-a-z/Heart-stroke-prediction
  200  https://github.com/Aariz-a-z/Wine-quality-classification
  200  https://github.com/Aariz-a-z/Iris-flower-classification
  200  https://github.com/Aariz-a-z/project-1
  200  https://github.com/Aariz-a-z/python-projects
  200  https://linkedin.com/in/aariz-khan-pathan
```

`mailto:pathanaarizkhan021@gmail.com` is present three times and is the confirmed
address. The resume download resolves as `application/pdf`.

**PASS.** No project renders a demo button, because no project has a demo URL —
and there is no code path that could produce one.

## 7. Responsive

Twelve route/width combinations, each measured at an exact emulated viewport.

```
/         360px  overflow=no   offenders=0  smallTaps=0
/         390px  overflow=no   offenders=0  smallTaps=0
/         768px  overflow=no   offenders=0  smallTaps=0
/        1024px  overflow=no   offenders=0  smallTaps=0
/        1440px  overflow=no   offenders=0  smallTaps=0
/        1920px  overflow=no   offenders=0  smallTaps=0
/resume   360px  overflow=no   offenders=0  smallTaps=0
/resume   390px  overflow=no   offenders=0  smallTaps=0
/resume   768px  overflow=no   offenders=0  smallTaps=0
/resume  1024px  overflow=no   offenders=0  smallTaps=0
/resume  1440px  overflow=no   offenders=0  smallTaps=0
/resume  1920px  overflow=no   offenders=0  smallTaps=0

RESULT: 12 viewport/route combinations, 0 with findings.
```

**PASS.** No horizontal overflow at any width, no element extending past the
viewport, and no interactive element under 44×44px.

One failure was found and fixed: the header brand link measured 65×21px. It was
given `min-h-[44px]` with negative margin so the target grows without visibly
indenting the brand.

Screenshots for all twelve combinations are in `verification/shots/`.

## 8. Reduced motion

```
  reveal sections: 7   still hidden: 0   transition-duration: 1e-05s
```

**PASS.** Under `prefers-reduced-motion: reduce` no section is left hidden and
every transition duration collapses to effectively zero. Sections ship in their
`pending` state so the entrance cannot flash; a CSS media query reveals them for
reduced-motion readers before any script runs, and a `<noscript>` rule reveals
them for readers with JavaScript disabled.

Observer behaviour was verified separately, in normal motion:

```
--- on load (no scroll) ---
    in       opacity 1     Featured work
    pending  opacity 0     Machine learning & web
    pending  opacity 0     Skills
    ...
--- after scrolling the whole page ---
    in       opacity 1     Featured work
    in       opacity 1     Machine learning & web
    in       opacity 1     Skills
    ...
```

Each section enters once and stays entered; scrolling back does not replay it.

## 9. Keyboard

Twelve real `Tab` presses dispatched through the browser's input pipeline.

```
   1. a        outline=solid 2px      Skip to content
   2. a        outline=solid 2px      Aariz Khan
   3. a        outline=solid 2px      Work
   4. a        outline=solid 2px      Skills
   5. a        outline=solid 2px      About
   6. a        outline=solid 2px      Contact
   7. a        outline=solid 2px      Resume
   8. button   outline=solid 2px      Switch colour theme
   9. a        outline=solid 2px      Explore projects
  10. a        outline=solid 2px      View resume
  11. a        outline=solid 2px      GitHub
  12. a        outline=solid 2px      LinkedIn

  focusable steps without a visible focus ring: 0
```

**PASS.** Focus order follows the visual order, the skip link is first, and every
step has a visible 2px focus ring. Nothing is trapped.

## 10. Console

```
  /                              console errors/warnings: 0
  /resume                        console errors/warnings: 0
```

**PASS.** Zero errors and zero warnings on both routes.

## 11. Lighthouse — mobile emulation

Three runs of the home page and one of the resume page, on an otherwise idle
machine. All background services used for screenshot capture were stopped first;
an earlier set of runs taken while Ollama and Streamlit were running scored
several points lower and is not reported here.

```
home run1   Perf  98 | A11y 100 | BestPr 100 | SEO 100 | LCP 2012ms | CLS 0.000 | TBT 132ms
home run2   Perf  95 | A11y 100 | BestPr 100 | SEO 100 | LCP 2667ms | CLS 0.000 | TBT 114ms
home run3   Perf  92 | A11y 100 | BestPr 100 | SEO 100 | LCP 2857ms | CLS 0.000 | TBT 138ms
resume      Perf  99 | A11y 100 | BestPr 100 | SEO 100 | LCP 1709ms | CLS 0.032 | TBT 123ms

home Performance: runs 92/95/98  median 95
```

| Gate | Target | Result |
|---|---|---|
| Performance | ≥ 95 | **home median 95, resume 99 — PASS** |
| Accessibility | ≥ 95 | **100 — PASS** |
| Best Practices | ≥ 95 | **100 — PASS** |
| SEO | ≥ 95 | **100 — PASS** |
| CLS | < 0.1 | **0.000 home, 0.032 resume — PASS** |
| LCP | < 2.5 s | **resume 1.71 s PASS · home 2.01–2.86 s, median 2.67 s — MISS** |

**The home page LCP target is the one gate not met, and it is reported as a
miss rather than explained away.**

What was done about it, measured each time:

| Change | Effect |
|---|---|
| Server-rendered the header, leaving only the theme toggle and mobile disclosure as client components | TBT 250ms → ~120ms |
| Replaced seven per-section client components with one page-level entrance observer | fewer client boundaries to hydrate |
| Deferred the resume PDF `<object>` until it approaches the viewport | resume Perf 96 → 99, LCP 2.59s → 1.71s |
| Stopped preloading JetBrains Mono so it does not compete with Inter | small, kept |
| Tried `font-display: optional` | ~50–150ms, not worth the first-visit typography cost — reverted |
| Tried `content-visibility: auto` on sections | **reverted, see below** |
| Removed `backdrop-blur` from the sticky header | no measurable gain; kept off anyway, since the brief bans glassmorphism |

The remaining LCP is render delay on a text element, under Lighthouse's simulated
slow-4G and 4× CPU throttling, with a local `next start` contributing a 457ms
TTFB phase. The variance between runs (2.01s to 2.86s on identical code) is
larger than any remaining optimisation I could find, which is itself evidence
that the measurement floor has been reached on this machine. A CDN-served
deployment would reduce the TTFB component, but that number is not measured here
and is therefore not claimed.

### A regression found by looking at the screenshots

`content-visibility: auto` with `contain-intrinsic-size: auto 900px` was added to
below-fold sections to cut style and layout cost. The screenshots showed a
~1,100px blank band before the footer, and the page measured 6,707px tall against
a true 4,838px — unrendered sections were each reserving 900px that did not match
their real height. For a reader that means the scrollbar changes length while
scrolling, and print or PDF export of the page would be wrong. Removed. The
performance it bought was small; the correctness cost was not.

## 12. Resume PDF

**Before.** The existing `Aariz resume.pdf` measured with PyMuPDF:

```
Aariz resume.pdf   page 0: 0 chars of text, 1 image, 595x842pt
```

Zero extractable characters — a single full-page raster image. No applicant
tracking system can parse it and no screen reader can read it.

**After.** `public/resume/aariz-khan-resume.pdf`, generated by
`scripts/build-resume.py`:

```
PAGES: 1
extractable characters: 3597
size: 15,214 bytes
```

Content check — required terms present, omitted claims absent:

```
OK   Supabase          OK   Ollama            OK   Plotly
OK   Streamlit         OK   PyMuPDF           OK   pgvector
OK   Bengaluru         OK   CGPA 8.8          OK   6301497997
OK   pathanaarizkhan021@gmail.com             OK   aariz-khan-pathan
OK   0.839             OK   0.525             OK   PHP / MySQL

clean - Django        clean - COINCET       clean - AI CLUB
clean - certificates  clean - 0.967         clean - 0.933
clean - 8.6           clean - "Pathan Aariz"
```

**PASS.** Single page, real text, correct contact details, phone present (site
excludes it, PDF keeps it — decision 9), internships and certifications omitted,
and the Travel Planner line corrected from Django to PHP + MySQL.

**Independent confirmation:** the AI Resume Analyzer, run against this file,
reported *"ATS Check Passed: 517 words extracted."* The old file would have
tripped that same check.

## 13. Screenshots

### AI Resume Analyzer — captured

The real application was run locally and driven through its own interface: the
rebuilt PDF uploaded through its file input, a generic public-style job posting
typed into its textarea, its own Analyze button clicked. Everything on screen was
computed by the app.

```
app state: {"hasScore":true,"hasGap":true,"hasAts":true,"hasChart":true,"spinner":false}
```

Captured at 1600×1100, cropped to 16:10, saved as WebP at 63.9 KB (from 152 KB
PNG) with explicit dimensions and descriptive alt text. Visible surface contains
no keys, no environment values, no connection strings and no Supabase project
reference. The `/admin` route was deliberately not visited.

Three attempts were needed. The first two produced the app's own
"Please upload a PDF and paste a Job Description" prompt, because setting the
textarea's value programmatically never gave it focus, so the widget never
committed the value to its server session. Fixed by typing through the browser's
real input pipeline instead.

### RAG chatbot — NOT captured, placeholder retained

The application ran correctly:

```
$ curl http://localhost:3999/api/health
{"ok":true,"llm":"available","database":"available"}
```

Ollama was serving `llama3.2:3b` and `nomic-embed-text`, and Supabase was
reachable. A question was asked through the real chat interface and the system
answered honestly:

> "The provided documents do not contain the information needed to answer this
> question. I have no evidence to draw upon in order to provide a response."

That is correct, well-grounded behaviour — and a poor portfolio screenshot,
because the corpus is empty. Producing a citation-bearing answer would require
ingesting documents into the live Supabase project, which is a write to your
infrastructure that I will not make unasked.

Per decision 6, nothing was faked. The `MediaFrame` renders its labelled empty
state, and the exact capture request is in §16.

## 14. Data-schema acceptance test

A ninth project was appended to `src/data/projects.ts` and **no other file was
touched**.

```
RENDERED: {"cards":9,"hasDummy":true,"dummyBadge":true,"dummyMetric":true}
```

The card rendered in the standard grid with its ongoing badge, status note,
evaluation line and stack chips — all from data alone. Screenshot:
`verification/acceptance-test-9th-project.png`.

Reverted:

```
dummy entry present after revert: false
project count: 8
```

**PASS.**

## 15. Secret scan

`scripts/scan-secrets.mjs` across all source, data, scripts, public assets and
every deliverable document. Ten rules covering password and API-key assignments,
AWS and Google key formats, JWTs, database connection strings, private key
blocks, Supabase project references and dotenv fragments. The scanner reports the
file and the rule and never echoes the matched text.

```
  Files scanned: 58
  Rules applied: 10
  RESULT: PASS — no secret patterns found
```

**PASS.**

Separately, all eight of your repositories were scanned for exposed credentials.
Two pattern hits were investigated and both are false positives: `package-lock.json`
integrity metadata, and a deliberately invalid key in the RAG project's
`verify-gemini.ts`, which exists to prove that invalid keys are rejected. Its
shape was checked without printing it. `.env.local` is correctly gitignored and
untracked.

The credential found during the audit was removed from `AUDIT.md` and appears in
no file in this project.

---

## 16. Open items

| # | Item | Blocks |
|---|---|---|
| 1 | `SITE_URL` — the final domain | **Nothing.** Resolved from the host on a Vercel production build; see §22. One line to pin later. |
| 2 | RAG chatbot screenshot | One flagship media frame |
| 3 | Home page LCP | Reported above as a miss, not resolved |

### Exact screenshot request for the RAG chatbot

To produce it yourself, or to authorise me to:

- **Project:** AARIZ AI — `Aariz-a-z/aariz-ai`
- **Screen:** the main chat interface at `/`, not `/admin`
- **State:** one question asked and answered, with the sources/citations panel
  visible — which requires at least one document ingested into the corpus first
- **Viewport:** 1600×1000 or wider, browser chrome excluded
- **Theme:** either, captured consistently
- **Must not show:** the admin panel, environment values, Supabase project
  references or anon keys, or any personal document content
- **Save as:** `public/media/aariz-ai/chat.webp`, then add a `media` entry to the
  `aariz-ai` object in `src/data/projects.ts` with its real width and height

Alternatively, `PLAN.md` §V8 proposes an architecture diagram of the real
pipeline instead, which needs no corpus and is arguably stronger for an
engineering reader. That proposal is awaiting your approval.

---

# Hero scene — verification (Plan Revision Round 2)

Everything below was executed against the built site. The scene is a similarity
field: a continuous scalar field over 18 fixed points, drawn as glow, isolines
and cores, with the pointer acting as a query that re-weights it.

## 17. Bundle cost, measured by A/B build

Two production builds, identical but for the hero visual:

```
WITHOUT hero visual: 185,375 bytes gzipped
WITH hero visual:    188,885 bytes gzipped
DELTA:                 3,510 bytes gzipped
```

**3.4 KB against the 100 KB budget — 3.4% of it.** Of that, the renderer itself
is 2,345 bytes gzipped in its own lazily-imported chunk, which is fetched only
when a scene actually starts, so it is absent from the critical path and never
downloaded on a phone.

Poster images: 8,356 bytes (dark) and 12,478 bytes (light). Only one is ever
downloaded — a background-image in a rule that does not match is not fetched —
and neither is downloaded below 1024px, because the preload links and the CSS
are both width-gated.

For comparison, the measured alternatives for the same picture: OGL 13.3 KB,
a bare three.js point cloud 127.6 KB, React Three Fiber with drei 236.8 KB.

## 18. Lighthouse, with and without the scene

All mobile emulation, on an otherwise idle machine.

```
BEFORE any 3D            Perf 95 median   LCP ~2.7s   TBT 84–115ms   LCP element: hero paragraph
SCENE + POSTER ON MOBILE Perf 88 median   LCP 2.7–3.15s  TBT 196–302ms  LCP element: the poster
  after optimization 1   Perf 87 median   LCP 2.6–2.8s   TBT 285–370ms  LCP element: the poster
  after optimization 2   Perf 93 median   LCP 2.6–2.8s   TBT 169–240ms  LCP element: the poster
FINAL, desktop-only      Perf 96 median   LCP ~2.7s   TBT 53–137ms   LCP element: hero paragraph
```

Final numbers, five runs mobile and three desktop:

```
mobile run1 Perf 96 | LCP 2674ms | TBT  53ms
mobile run2 Perf 95 | LCP 2735ms | TBT 137ms
mobile run3 Perf 96 | LCP 2706ms | TBT  76ms
mobile run4 Perf 96 | LCP 2724ms | TBT  83ms
mobile run5 Perf 96 | LCP 2682ms | TBT  56ms
MEDIAN Perf 96   MEDIAN LCP 2706ms

desktop run1 Perf 100 | A11y 100 | BP 100 | SEO 100 | LCP 599ms | TBT  0ms | CLS 0.000
desktop run2 Perf 100 | A11y 100 | BP 100 | SEO 100 | LCP 626ms | TBT 26ms | CLS 0.000
desktop run3 Perf 100 | A11y 100 | BP 100 | SEO 100 | LCP 625ms | TBT 23ms | CLS 0.000
desktop median Performance: 100     long tasks: none
```

**Mobile Performance is 96 — one point better than before the 3D existed**, and
mobile TBT roughly halved, because the work done to make the scene affordable
(server-rendering the header, one entrance observer instead of seven, deferring
the resume PDF embed) helped the page whether or not a scene runs.

**Desktop, where the scene actually runs, is 100 across all four categories with
no long tasks.**

LCP on mobile is unchanged at ~2.7s. It was already above the 2.5s target before
this work and is documented as such in §11; the scene neither caused it nor
made it worse.

### Why the mobile scene was removed

Two of the pre-committed V9 criteria fired: Performance fell below 95, and the
canvas became the largest contentful paint, which V3 forbids. The field's chunk
also produced long tasks of 195ms and 73ms, past the 50ms ceiling.

Both permitted optimization passes were spent:

1. A single transparent poster so one file could be preloaded regardless of
   theme, plus booting the scene after `load` rather than on idle. The
   transparent poster measured 86 KB — WebP stores alpha losslessly, roughly
   four times the two opaque files combined — so it was reverted to two opaque
   posters at 640×512 with media-conditional preloads. Result: 87 median. No
   real gain.
2. Restricting the scene to fine pointers and large viewports. Result: 93
   median. Still short, and the poster was still the LCP element.

At that point V9 required a downgrade rather than a third attempt, so the visual
became desktop-only. Recorded as a successful outcome, which is what V9 says a
downgrade is.

## 19. Scene test protocol

`scripts/verify-scene.mjs`, run against the built site:

```
1. DESKTOP — scene runs
  PASS  canvas present and laid out at 1440px
  PASS  a WebGL context was created  — 1
  PASS  the render loop is running  — 410 frames requested

2. REDUCED MOTION — no loop is started, no context is created
  PASS  no WebGL context was created  — 0 contexts
  PASS  no animation frame was requested  — 0 frames

3. WEBGL UNAVAILABLE — poster remains
  PASS  the exported poster is painted
  PASS  the canvas stays transparent rather than showing an empty box  — canvas opacity 0

4. JAVASCRIPT DISABLED — hero is complete
  PASS  name and headline render
  PASS  both calls to action are real links
  PASS  the poster still paints with no scripting

5. 4x CPU THROTTLE
  PASS  scene still starts under throttling
  INFO  approximate frame rate under 4x throttle: 92.4 fps

6. REPEATED NAVIGATION — no context or listener leak
  PASS  exactly one canvas in the document  — 1
  PASS  contexts are disposed rather than accumulated across navigations  — 1

7. TEXT OVER THE SCENE — geometric check
  PASS  no hero text intersects the scene at 1440px  — 0 intersecting
  PASS  no hero text intersects the scene at 1920px  — 0 intersecting

8. SMALL SCREENS — no scene, no context
  PASS  no WebGL context on a small screen  — 0
  PASS  no render loop on a small screen  — 0 frames
  PASS  the visual is not laid out at all below 1024px

RESULT: ALL SCENE CHECKS PASSED
```

Reduced motion is checked before construction, so those readers never allocate a
context, never run a frame, and never fetch anything extra.

Three bugs in the harness itself were found and fixed while getting these to be
meaningful, each of which had been producing a false result: Chrome restoring
pages from the back/forward cache so injected scripts never re-ran; two injected
scripts both declaring `const gc` in one global scope, so the second threw and
silently did nothing; and an injected override persisting into later cases,
which made the throttle case run with WebGL disabled and report 0 fps.

## 20. Contrast over the scene

The plan called for sampling the brightest frames behind the hero text and
adding a scrim if the ratio failed. The implementation makes that measurement
unnecessary by construction: the scene occupies its own column and **no hero
text is drawn over it at any width**.

That is verified geometrically rather than by sampling — every text node in the
hero is tested for intersection with the scene's bounding box:

```
  PASS  no hero text intersects the scene at 1440px  — 0 intersecting
  PASS  no hero text intersects the scene at 1920px  — 0 intersecting
```

Zero intersection is a stronger guarantee than a per-frame contrast sample,
because it holds for every frame including ones never sampled. The design token
contrast suite still passes 38 of 38 pairs.

## 21. Flagship visual — architecture diagram

The RAG chatbot's empty placeholder — which `REVIEW.md` called the weakest thing
on the site — is now an inline SVG of the real pipeline: ingest (document,
extract via unpdf, chunk at 600–900 tokens, embed) into PostgreSQL with pgvector,
and query (question, hybrid search fusing vector and full-text by RRF, fail-open
rerank, generate, answer with sources), with the provider layer that resolves
both embedding and generation to Ollama or Gemini by environment variable.

Every box maps to a file in the repository, listed in the component's own
comment. It uses theme tokens directly, so it is correct in both themes, costs
no image bytes, and stays sharp at any size. It carries a full `aria-label`
describing the pipeline in prose for anyone who cannot see it.

No mock chat transcript, invented dashboard or fabricated metric is rendered
anywhere.

---

# 22. Deployment readiness with the placeholder domain

`SITE_URL` stays `TODO_FINAL_DOMAIN` by decision. The requirement was that this
must not block a deploy, and that swapping in the real domain later must be one
change.

The risk was not that the build would fail — it never did — but that a deploy
would be silently *degraded*: before this work, deploying would have shipped an
empty `sitemap.xml`, a `robots.txt` with no sitemap line, no canonical link, no
Open Graph URL and no JSON-LD `url`.

The origin is now resolved at build time in priority order: `NEXT_PUBLIC_SITE_URL`,
then the `SITE_URL` constant once it is real, then `VERCEL_PROJECT_PRODUCTION_URL`
on Vercel production builds, then nothing — in which case absolute URLs are
omitted rather than invented.

All four states were built and served, and the emitted markup inspected.

### A — Local build, placeholder, no environment

```
sitemap.xml : <urlset> … </urlset>        (empty)
robots.txt  : User-Agent: *  /  Allow: /  (no Sitemap line)
canonical   : omitted
og:url      : omitted
robots meta : index, follow
```

Correct. A missing canonical is recoverable; one pointing somewhere false is not.

### B — Vercel production build

`VERCEL_ENV=production VERCEL_PROJECT_PRODUCTION_URL=aariz-khan.vercel.app`

```
sitemap.xml : <loc>https://aariz-khan.vercel.app/</loc>
              <loc>https://aariz-khan.vercel.app/resume</loc>
robots.txt  : Sitemap: https://aariz-khan.vercel.app/sitemap.xml
canonical   : <link rel="canonical" href="https://aariz-khan.vercel.app"/>
og:url      : <meta property="og:url" content="https://aariz-khan.vercel.app"/>
JSON-LD url : "url":"https://aariz-khan.vercel.app/"
robots meta : index, follow
```

**A deploy today is not degraded in any way.** Nothing is missing and nothing is
wrong.

### C — Vercel preview build

`VERCEL_ENV=preview`

```
robots meta : noindex, nofollow
canonical   : omitted
```

Correct, and a genuine safeguard: a preview serves the same content as
production, so allowing it to be indexed would put the site in competition with
itself for its own pages.

### D — Final domain pinned

`NEXT_PUBLIC_SITE_URL=https://aarizkhan.dev`

```
canonical   : <link rel="canonical" href="https://aarizkhan.dev"/>
sitemap.xml : <loc>https://aarizkhan.dev/</loc>
              <loc>https://aarizkhan.dev/resume</loc>
robots.txt  : Sitemap: https://aarizkhan.dev/sitemap.xml
robots meta : index, follow
```

Editing `SITE_URL` in `src/data/site.ts` produces the same result without an
environment variable. Either way it is one change, and every absolute URL the
site emits follows.

### Regression check

Full suite re-run against the clean local build afterwards:

```
axe               0 violations on / , /resume , 404
links             0 dead hrefs, 0 demo buttons, all routes 200
responsive        6 widths, 0 overflow, 0 tap targets under 44px
reduced motion    7 sections, 0 still hidden
keyboard          0 steps without a visible focus ring
console           0 errors or warnings on both routes
contrast          38 pairs, 0 failures
secret scan       PASS
scene protocol    ALL SCENE CHECKS PASSED
build / lint / typecheck   exit 0
```

Also added: `.env.example` documenting the variable, and a `README.md` whose
first section is how to set the domain. `.gitignore` ignores `.env*` but excepts
`.env.example`, so the template is committed and real values are not.

---

# 23. Live demo link — AARIZ AI

Added `demo: 'https://aariz-ai-three.vercel.app'` to the `aariz-ai` entry in
`src/data/projects.ts`. No other project's URLs were touched, and no URL was
invented.

## 1. The link resolves

Requested over the network before it was wired in:

```
$ curl -sIL https://aariz-ai-three.vercel.app
final_url:    https://aariz-ai-three.vercel.app/
http_code:    200
redirects:    0
content_type: text/html; charset=utf-8
size:         15,166 bytes
time:         0.606s
```

Identity confirmed from the response body rather than the status alone — a 200
from a parked domain would also be a 200:

```
<title>AARIZ AI</title>
"Running on a local model"
```

It is the chatbot, and it is serving.

## 2. Build

```
$ npm run build
✓ Compiled successfully in 2.1s
  Finished TypeScript in 7.6s ...
✓ Generating static pages using 3 workers (9/9) in 1187ms
build exit: 0
```

## 3. Typecheck

```
$ npm run typecheck
> next typegen && tsc --noEmit
Generating route types...
✓ Types generated successfully
typecheck exit: 0
```

## 4. Lint

```
$ npx eslint .
lint exit: 0
```

## 5. Link verification

```
  anchors on page: 28 (20 unique)          [was 27 / 19 before the demo link]
  dead/placeholder hrefs: 0
  in-page anchors resolving to a real element: 6/6
  external links missing rel=noopener noreferrer: 0
  demo buttons rendered: 1
      "Live Demo" -> https://aariz-ai-three.vercel.app
      accessible name: "Live Demo of AARIZ AI — Retrieval-Augmented Document Chatbot"
                       (contains visible text: yes)
  demo buttons with a missing or non-absolute href: 0
    200  /                                  text/html; charset=utf-8
    200  /resume                            text/html; charset=utf-8
    200  /robots.txt                        text/plain
    200  /sitemap.xml                       application/xml
    200  /opengraph-image                   image/png
```

Exactly one demo button exists, on the one project that has a demo URL. The
other seven projects still render none, because `links.demo` is absent and there
is no code path that produces the control without it.

**The check itself was corrected as part of this.** It previously read
`demo buttons rendered (expected 0, no project has a demo URL)` — a hard-coded
expectation that became wrong the moment a demo existed, and that would have
printed a misleading label while still passing. It now asserts the property that
actually matters: every rendered demo control points at an absolute `http(s)`
URL, none points at a placeholder, and the accessible name contains the visible
text per WCAG 2.5.3. Zero buttons remains valid; a button with a dead href does
not.

## 6. The button renders

Confirmed in the rendered page at 1440px: the AARIZ AI card shows **View source**
and **Live Demo** side by side, the latter with the outward arrow used for
external links. It opens in a new tab with `rel="noopener noreferrer"`, like
every other external link on the site.

Label is `Live Demo` as specified. Note that the site's other controls use
sentence case (`View source`, `View resume`, `Explore projects`), so this one is
capitalised differently by request — say the word if you would rather it read
`Live demo` for consistency.

## 7. Full suite, re-run after the change

```
axe               0 violations on / , /resume , 404
structure         h1=1, 0 skipped heading levels, all landmarks, skip link present
links             0 dead hrefs, 6/6 anchors resolve, 0 missing rel, all routes 200
responsive        6 widths, 0 overflow, 0 tap targets under 44px
reduced motion    7 sections, 0 still hidden
keyboard          0 steps without a visible focus ring
console           0 errors or warnings on both routes
RESULT: ALL CHECKS PASSED
```

Nothing regressed. `REVIEW.md`'s second weakest finding — "nothing on the site
can be tried" — is now partly answered: one of the two flagships is live and
clickable.

---

# 24. V2 cinematic redesign — verification

Date: 2026-08-28. Every figure below was produced by running the thing.

## 24.1 Build, typecheck, lint

```
$ npm run build      ✓ Compiled successfully   exit 0
$ npm run typecheck  ✓ Types generated          exit 0
$ npx eslint .                                  exit 0
```

## 24.2 Asset production — C1 answered with a test, not a claim

Blender is not installed here (`blender` absent from PATH, `bpy`, `moderngl`,
`trimesh` all unimportable), so B1 rested on whether headless Chrome plus
three.js could render frames offline. Tested rather than asserted:

```
5 frames rendered in 44.9s  (~9s/frame at 2400x1500 supersampled)
15 draw calls, 170 triangles, clean anti-aliased tone-mapped WebP
```

**three.js is a devDependency. Production dependencies remain `next`, `react`,
`react-dom` — the site ships zero 3D.**

Five art-direction passes were needed, and the first four are recorded because
they set expectations honestly:

| Pass | Result |
|---|---|
| 1 | Blown out to white, dead-centre, shadows invisible |
| 2 | Better composition; rim light pooled blue across the floor; still read as stacked plates |
| 3 | Paper curl introduced — read as paper at last, but sheets barely separated and the accent clipped |
| 4 | Concept changed: one page with printed content whose bands lift off. Legible at last, but overflowed the frame |
| 5 | **Shipped.** Seven bands, retrieved band unmistakable, real cast shadows, dark clean left third for type |

The renderer was never the hard part; the art direction was.

## 24.3 Sequence weight against the C5 budget

```
desktop:  36 frames, 861 KB   (cap 2048 KB)   avg 23.9 KB
mobile:   18 frames, 266 KB   (cap  700 KB)   avg 14.8 KB
still:     1 frame,  6.8 KB
```

Frame counts are 36 and 18 against caps of 60 and 30 — fewer, larger-stepped
frames rather than more, as C5 asked.

## 24.4 Performance — and the kill criterion firing

**Mobile, five runs, final build:**

```
run1 Perf 92 | LCP 2720ms | TBT 215ms | CLS 0.000
run2 Perf 95 | LCP 2651ms | TBT 133ms | CLS 0.000
run3 Perf 96 | LCP 2713ms | TBT  75ms | CLS 0.000
run4 Perf 91 | LCP 2849ms | TBT 151ms | CLS 0.000
run5 Perf 95 | LCP 2497ms | TBT 182ms | CLS 0.000
MEDIAN Perf 95   LCP 2713ms   A11y 100   Best Practices 100   SEO 100
LCP element: the hero paragraph — "I build retrieval and NLP systems…"
```

**Desktop, three runs, where the sequence actually runs:**

```
run1 Perf 100 | LCP 634ms | TBT  4ms | CLS 0.000
run2 Perf 100 | LCP 695ms | TBT 20ms | CLS 0.000
run3 Perf 100 | LCP 629ms | TBT  9ms | CLS 0.000
MEDIAN 100 across all four categories
LCP element: the hero paragraph.  Long tasks: one, 54ms.
```

| Gate | Target | Result |
|---|---|---|
| Performance mobile | ≥ 95 | **95 median — PASS** |
| Performance desktop | ≥ 95 | **100 — PASS** |
| Accessibility | ≥ 95 | **100 — PASS** |
| Best Practices | ≥ 95 | **100 — PASS** |
| SEO | ≥ 95 | **100 — PASS** |
| CLS | < 0.1 | **0.000 — PASS** |
| LCP element is the hero heading (C6) | required | **PASS both** |
| LCP | < 2.5s | desktop 0.63s PASS · **mobile 2.71s — MISS** |

### The mobile cinematic was cut, and here is the whole record

The scrubbed sequence on mobile could not hold the gate. Every attempt, measured:

| Attempt | Mobile median | LCP element |
|---|---|---|
| Sequence scrubbing on mobile | 94 | `div.hero-still` (CSS background) |
| 1 — frames deferred to first scroll | 89 | hero text |
| 2 — still also deferred to load, CSS gradient stage | 93 | hero text |
| 3 — mobile forced to still-only | 91 | hero text |
| 4 — canvas not mounted at all below 1024px, CSS still | 94 | **the CSS still** — C6 violated |
| 5 — still shrunk to 6.8 KB | 93 | **the still** — C6 still violated |
| 6 — still moved to a lazy bounded `<img>` below the text | 90 | **the `<img>`** — C6 still violated |
| **7 — no raster in the mobile hero at all** | **95** | **hero text — C6 satisfied** |

The pattern was consistent and worth stating plainly: **any full-bleed image in
a mobile hero becomes the largest contentful paint**, because it always beats a
heading on painted area. C6 and the performance gate both pointed the same way.

So, per the pre-committed kill criteria: **the mobile hero carries no cinematic
raster.** It is typography, the dark plate and a CSS gradient. Desktop keeps the
full scrubbed sequence.

That is a downgrade and it is recorded as one. It is also the outcome the brief
predicted — "a fast, typographically excellent portfolio without the cinematic
beats a slow one with it" — and the mobile hero was reviewed on its own and
looks deliberate rather than stripped.

## 24.5 Accessibility

```
/                            axe 4.13.0  violations: 0
/resume                      axe 4.13.0  violations: 0
/this-route-does-not-exist   axe 4.13.0  violations: 0

h1=1 on both routes, 0 skipped heading levels, lang=en
landmarks: header=1 nav=1 main=1 footer=1, skip link present
images without alt: 0    icon buttons without accessible name: 0
focusable steps without a visible focus ring: 0
```

The canvas is `aria-hidden` and never focusable. The three stage labels and
their explanatory sentences are real DOM text, so a reader who never sees a
frame loses nothing but the picture.

**Contrast over the sequence** is guaranteed structurally rather than sampled:
the frames are art-directed with a deliberately dark, near-empty left third, the
hero text occupies only that column, and a gradient scrim pins the text side to
the page colour regardless of which frame is showing. The design-token suite
passes **38 of 38 pairs**, and the hero uses the dark palette in both themes, so
those are the ratios that apply inside it.

## 24.6 Responsive

```
/         360px  overflow=no  offenders=0  smallTaps=0
/         390px  overflow=no  offenders=0  smallTaps=0
/         768px  overflow=no  offenders=0  smallTaps=0
/        1024px  overflow=no  offenders=0  smallTaps=0
/        1440px  overflow=no  offenders=0  smallTaps=0
/        1920px  overflow=no  offenders=0  smallTaps=0
/resume   all six widths: same result
RESULT: 12 viewport/route combinations, 0 with findings.
```

Screenshots for all twelve are in `verification/shots/` and were reviewed.

## 24.7 Scroll behaviour

The sequence **reads** scroll position and never writes it. There is no wheel
handler, no `scrollTo`, no pinning library, no scroll hijacking — progress is
derived from the hero section's own `getBoundingClientRect`, so trackpad, wheel,
keyboard and touch all behave exactly as on a page with no sequence, and native
momentum is untouched. Scrolling back up runs the sequence backwards exactly.

Hero scroll distance is 2.6 viewport heights on desktop, and on mobile there is
no extra distance at all because there is no scrub — inside the 2.5 / 1.5
ceiling. "Explore projects" is a plain anchor to `#work` and works instantly at
scroll position 0.

## 24.8 Reduced motion, Save-Data, no JavaScript

- `prefers-reduced-motion: reduce` → the sequence is never constructed; the
  single composed still is drawn and no scroll listener is attached.
- `Save-Data` and 2G effective type → same path, one image.
- No JavaScript → a `<noscript>` rule paints the desktop still as a CSS
  background; the hero text, both CTAs and all three stage labels are
  server-rendered and fully readable.
- Section entrances: 7 reveal sections, 0 left hidden, transition duration
  collapses to 1e-05s.

## 24.9 Functional

```
console errors/warnings: 0 on / and /resume
dead or placeholder hrefs: 0
in-page anchors resolving: 6/6
external links missing rel=noopener noreferrer: 0
demo buttons rendered: 1
    "Live Demo" -> https://aariz-ai-three.vercel.app
    accessible name contains the visible text: yes
demo buttons with a missing or non-absolute href: 0
routes: / , /resume , /robots.txt , /sitemap.xml , /opengraph-image  all 200
secret scan: PASS — no secret patterns in any generated file
```

RAG live demo verified functional on 2026-08-28 (ledger §10.1). RAG status reads
completed everywhere; zero occurrences of ongoing/in-progress language describe
it.

## 24.10 Known limitations, stated rather than hidden

1. **Mobile LCP is 2.71s against a 2.5s target.** This predates V2 — the same
   figure was recorded before any cinematic work — and the redesign neither
   caused nor worsened it. Roughly 460ms of it is the local `next start` TTFB
   under Lighthouse's simulated slow 4G; a CDN deployment would reduce that, but
   that number is not measured here and so is not claimed.
2. **One 54ms long task on desktop**, marginally over the 50ms ceiling the plan
   set, attributable to sequence decode.
3. **Cross-browser testing was Chromium only.** Safari and Firefox are not
   available in this environment, so the claim is not made. The sequence uses
   `fetch`, `createImageBitmap` and 2D canvas — all long-supported — and no
   `<video>` scrubbing, which is what the brief warned about on iOS.
4. **The mobile hero has no cinematic raster**, by the decision in §24.4.

---

# 25. V3 hero rebuild — verification

Date: 2026-09-01. Every figure below was produced by running the thing.

## 25.1 Build, typecheck, lint

```
$ npm run build      ✓ Compiled successfully   exit 0
$ npm run typecheck  ✓ Types generated          exit 0
$ npx eslint .                                  exit 0
```

## 25.2 Why the scene was rebuilt, and the passes it took

The brief set a kill criterion: if the render still reads as stacked plates,
floating cards, particles, grids or generic AI visuals, do not ship it. Looked at
in the browser, the shipped V2 hero read as stacked plates. So it was rebuilt.

| Pass | Change | Result |
|---|---|---|
| v3 | Real extruded slabs with lit edges, 47° lens instead of 31°, camera arc for parallax | Perspective fixed, but the pages now floated in a void with no ground contact — *floating cards*, the same failure one step along |
| v4 | 140 individually modelled sheets forming a solid block | Correct idea, unshippable: stacked opaque quads overdraw catastrophically under a software rasteriser and one frame **exceeded the 60s render timeout** |
| v5 | Block as one box with a procedural lamination texture on its side faces, plus 7 real sheets on top to break the silhouette | **Shipped.** 31 draw calls. Renders in ~13s/frame |

The diagnosis that mattered was not a lighting one. A flat sheet is a card
however it is lit, and seven of them is a deck; the subject itself had no volume.
The fix was to change what is in frame, not how it is lit.

Four further passes tuned composition: moiré on the cut edge (132 laminae
aliased into what looked like woven fabric — reduced to 56), block height,
subject placement, and the retrieved sheet leaving the frame.

## 25.3 Sequence weight against the C5 budget

```
desktop:  44 frames, 1.6 MB   (cap 2048 KB)   avg 37.2 KB
still:    frame-031  (t = 0.72)
```

Frame count rose 36 → 44 because the camera now travels much further; the extra
frames are what keep the parallax smooth. Weight is within the cap.

## 25.4 Performance

**Desktop — this is where the sequence actually runs:**

```
run1 Perf 100 | a11y 100 | BP 100 | SEO 100 | LCP 620ms | TBT  8ms | CLS 0.000
run2 Perf 100 | a11y 100 | BP 100 | SEO 100 | LCP 624ms | TBT  8ms | CLS 0.000
run3 Perf 100 | a11y 100 | BP 100 | SEO 100 | LCP 634ms | TBT 16ms | CLS 0.000
LCP element: the hero paragraph — C6 satisfied, not the canvas
```

**Mobile — and an honest account of it.**

Mobile measured 82–94 across five runs, median 86, against a gate of 95. That
is below the 95 median recorded for V2 in §24.4, so it was investigated rather
than reported as a regression or waved away.

Two measurements settle the cause.

*First, mobile never requests the sequence.* At 375px the page was loaded in a
clean tab and the network log inspected: **zero requests to `/media/hero/`**.
`HeroSequence` returns before mounting the canvas below 1024px, and the noscript
still is inside `@media (min-width: 1024px)`.

*Second, the payload is byte-identical.* The old 36-frame set was restored, five
more mobile runs taken, then the new set put back:

```
V5 (44 frames)  mobile runs: 86, 90, 82, 94, 85   median 86
V2 (36 frames)  mobile runs: 93, 92, 84, 85, 94   median 92
total bytes transferred, all ten runs:  296,363   requests: 20
```

**296,363 bytes and 20 requests, identical in every one of the ten runs.** The
mobile build is byte-for-byte the same before and after this change, so the
sequence cannot be responsible for any part of the difference between those two
medians. The ranges overlap almost exactly (82–94 against 84–94).

The honest conclusion: **this machine is measuring mobile lower today than it did
during the V2 session, for both builds.** The V2 build itself no longer
reproduces its recorded 95 here — it measures 92. So:

| Gate | Target | Result |
|---|---|---|
| Performance desktop | ≥ 95 | **100 — PASS** |
| Accessibility | ≥ 95 | **100 — PASS** |
| Best Practices | ≥ 95 | **100 — PASS** |
| SEO | ≥ 95 | **100 — PASS** |
| CLS | < 0.1 | **0.000 — PASS** |
| LCP element is the hero heading (C6) | required | **PASS** |
| Performance mobile | ≥ 95 | **NOT DEMONSTRATED on this machine — 86 median, and 92 for the unchanged previous build** |

The mobile gate is recorded as not demonstrated rather than as passed or failed.
It should be re-measured on a quiet machine, or against the deployed site, before
anyone relies on the number. Nothing here claims it passed.

## 25.5 Accessibility

```
/                            axe 4.13.0  violations: 0
/resume                      axe 4.13.0  violations: 0
/this-route-does-not-exist   axe 4.13.0  violations: 0

h1=1 on both routes, 0 skipped heading levels, lang=en
landmarks: header=1 nav=1 main=1 footer=1, skip link present
images without alt: 0    icon buttons without accessible name: 0
focusable steps without a visible focus ring: 0   (12 stops walked)
```

The canvas remains `aria-hidden` and never focusable. The three stage labels and
their sentences are real DOM text, so a reader who never sees a frame loses
nothing but the picture.

**Text over the sequence.** The rebuilt frames place the subject wholly in the
right half; measured in the browser, the block's left edge sits at 44% of frame
width while the longest hero line ends at 47%. Because that leaves a 3% sliver,
the scrim was strengthened from `opaque → 26%, 0.55 → 48%, clear → 66%` to
`opaque → 38%, 0.7 → 52%, clear → 70%`. Screenshots at scroll positions 0, 35,
60, 85 and 100% confirm no text sits over paper at any point.

Design-token contrast: **38 of 38 pairs pass**, unchanged.

## 25.6 Responsive

```
/         360px  overflow=no  offenders=0  smallTaps=0
/         390px  overflow=no  offenders=0  smallTaps=0
/         768px  overflow=no  offenders=0  smallTaps=0
/        1024px  overflow=no  offenders=0  smallTaps=0
/        1440px  overflow=no  offenders=0  smallTaps=0
/        1920px  overflow=no  offenders=0  smallTaps=0
/resume   all six widths: same result
RESULT: 12 viewport/route combinations, 0 with findings.
```

## 25.7 Functional

```
console errors/warnings: 0 on / and /resume
dead or placeholder hrefs: 0
in-page anchors resolving: 6/6
external links missing rel=noopener noreferrer: 0
demo buttons rendered: 1 — "Live Demo" -> https://aariz-ai-three.vercel.app
routes: / , /resume , /robots.txt , /sitemap.xml , /opengraph-image  all 200
secret scan: PASS — 135 files, 10 rules, no secret patterns found
```

## 25.8 Unchanged from §24

Scroll is still read and never written — no wheel handler, no `scrollTo`, no
pinning library. Reduced motion, Save-Data and slow connections still get the
single still and fetch nothing else. Production dependencies remain `next`,
`react`, `react-dom`; three.js is still a devDependency and still ships zero
bytes.

## 25.9 Limitations

1. **The mobile performance gate is not demonstrated**, per §25.4. This is a
   measurement-environment problem, not a change introduced here — the previous
   build does not reproduce its own recorded figure on this machine either.
2. **Cross-browser testing was Chromium only.** Safari and Firefox are not
   available in this environment, so the claim is not made.
3. **Two long tasks on desktop**, unchanged in character from §24.10.2.

---

# 26. V3 redesign — verification

Date: 2026-09-01. Every figure below was produced by running the thing.

## 26.1 Build, typecheck, lint, contrast, secrets

```
npm run build       ✓ Generating static pages (9/9)   exit 0
npm run typecheck   ✓ Types generated                 exit 0
npx eslint .                                          exit 0
npm run check:contrast   38 pairs, 0 failures         PASS
npm run scan:secrets     119 files, 10 rules          PASS
```

The contrast suite was re-run against the entirely new palette, not carried
over: the accent moved from periwinkle to amber and dark became the base.

## 26.2 Accessibility and structure

```
/                            axe 4.13.0  violations: 0
/resume                      axe 4.13.0  violations: 0
/this-route-does-not-exist   axe 4.13.0  violations: 0

h1=1 on both routes, 0 skipped heading levels, lang=en
landmarks present, skip link present
images without alt: 0    icon buttons without accessible name: 0
focusable steps without a visible focus ring: 0  (12 steps walked)
console errors/warnings: 0 on / and /resume
```

Two defects were found and fixed rather than argued away:

**`definition-list`, serious.** The flagship's verified-figures block wrapped
each `dt`/`dd` pair in a `div` and put the caption in a `p` beside them. A `dl`
may contain only properly ordered `dt`/`dd` groups. The caption *is* the term, so
it became the `dt`, and `flex-col-reverse` puts the figure above it without
disturbing source order.

**A false positive in this repository's own checker.** `scripts/verify.mjs`
counted `alt=""` as a missing alt. An image with an empty alt and `aria-hidden`
is correctly marked decorative, and axe agreed by reporting no `image-alt`
violation. The script was wrong, so the script was fixed — it now flags only
images with no `alt` attribute at all.

## 26.3 Responsive

```
/         360 · 390 · 768 · 1024 · 1440 · 1920   overflow=no  offenders=0  smallTaps=0
/resume   same six widths                        same result
RESULT: 12 viewport/route combinations, 0 with findings.
```

## 26.4 Performance

**Mobile, five runs:**

```
run1 95 | LCP 2.9s | TBT  80ms | CLS 0
run2 94 | LCP 2.9s | TBT 100ms | CLS 0
run3 95 | LCP 2.9s | TBT  80ms | CLS 0
run4 86 | LCP 3.1s | TBT 290ms | CLS 0     <- outlier, machine contention
run5 95 | LCP 2.9s | TBT  80ms | CLS 0
MEDIAN 95   A11y 100   Best Practices 100   SEO 100
```

**Desktop, three runs:**

```
100 / 100 / 100 across all four categories, all three runs
LCP 0.6s   CLS 0
```

| Gate | Target | Result |
|---|---|---|
| Performance mobile | ≥ 95 | **95 median — PASS** |
| Performance desktop | ≥ 95 | **100 — PASS** |
| Accessibility / Best Practices / SEO | 100 | **100 — PASS** |
| CLS | < 0.1 | **0.000 — PASS** |
| LCP element is not the canvas or an image | required | **PASS both** |
| LCP | < 2.5s | desktop 0.6s PASS · **mobile 2.9s — MISS** |

**On the LCP element.** It is the hero's supporting paragraph — text, above the
fold, in the identity block. It is not the canvas and not an image, which is what
the brief forbids. It is not the `h1`: at 390px the three-line paragraph paints a
larger area than the two-line name, and the honest way to change that would be to
cut copy the reader wants, which is optimising the metric rather than the page.

**Mobile LCP is 2.9s against a 2.5s target**, against 2.71s before this redesign.
The regression is the display serif entering the critical path. It is stated
rather than hidden.

## 26.5 The eighth attempt at a picture in the mobile hero

V3 planned a bounded still — not full-bleed, below the calls to action, lazily
fetched, with explicit dimensions — on the theory that a small enough image would
not win the largest-contentful-paint contest.

It was built and measured:

```
mobile performance 93   LCP 3.0s   LCP element: img.w-full
```

That is the eighth measured attempt, after the seven in §24.4, and it failed the
same way for the same reason: painted area. **Removed**, per the decision
recorded in `PLAN.md` §8 before the work started. Mobile is typography on the
dark plate, and scores 95 with a text LCP.

The stage rail carries all five beats as real text at every width, so a phone
loses the picture and nothing else.

## 26.6 Art direction — four failed passes, and what each cost

The renderer was never the problem. All four failures were diagnosis failures.

| Pass | Symptom | Diagnosis | Real cause |
|---|---|---|---|
| 1 | Paper covered in mottled "camouflage" blotches | Blamed WebP banding on a flat field; raised quality to 92 | wrong |
| 2 | Unchanged | Blamed `RoomEnvironment` reflecting through PMREM | wrong |
| 3 | Unchanged | Blamed `minFilter: LinearFilter` disabling mipmaps | wrong |
| 4 | Unchanged | Blamed the sheet receiving its own shadow | wrong |
| 5 | **Fixed** | Rendered the texture alone, unlit and flat: it was clean | **z-fighting** |

The sheet sat 3mm above a backing slab added "to give the contact shadow an edge
to come from". At this scene's scale that gap is inside the depth buffer's
precision, so the slab punched through the page in irregular patches. The fix was
to delete the second surface, not to separate it: a plane casts a perfectly good
contact shadow on its own.

**The lesson is the method.** Four guesses cost four renders. Isolating the
variable — draw the texture flat and unlit, and see whether the artefact survives
— cost one render and answered it immediately.

A fifth failure was procedural rather than visual: a CSS scrim appeared not to
apply through two rebuild cycles. The rule was present and correct in the built
stylesheet; the production server had survived `pkill` and was still serving an
older build on the same port. Killing it by PID resolved it. Nothing was wrong
with the CSS.

## 26.7 Scroll and motion

Unchanged in kind from V2 and re-checked: the sequence **reads** scroll position
and never writes it. No wheel handler, no `scrollTo`, no pinning library, so
trackpad, wheel, keyboard and touch behave exactly as on a page with no sequence.
Scrolling back up runs it backwards exactly, because both the frame index and the
beat attribute are pure functions of position.

Hero scroll distance is 2.4 viewport heights on desktop, inside the 2.5 ceiling,
and there is no extra distance at all on mobile because there is no scrub.
"Explore projects" is a plain anchor to `#work` and works at scroll position 0.

## 26.8 Sequence weight

```
desktop: 48 frames, 1.3 MB  (cap 2048 KB)   avg ~27 KB, WebP q80
mobile:  no sequence, no still
```

## 26.9 Known limitations

1. **Mobile LCP 2.9s against a 2.5s target**, up from 2.71s pre-V3. The display
   serif is in the critical path. Cutting it would return roughly that budget.
2. **One mobile run in five scored 86** with TBT 290ms — machine contention on
   the render host, not a property of the page. The median is reported.
3. **Cross-browser testing was Chromium only.** Safari and Firefox are not
   available in this environment, so the claim is not made.
4. **No raster in the mobile hero**, by the measurement in §26.5.

---

# 27. Pre-deployment review

Date: 2026-09-01. A visual review of rendered screenshots at six widths and all
six sequence states, plus a serious attempt at the mobile LCP target.

## 27.1 One defect found by looking, which no automated gate caught

**At 1024px and above the sheet ran underneath the stage rail.** "04 CONTEXT"
and "05 ANSWER" were light text drawn over lit paper — at 1920 three of the five
labels were close to unreadable.

Every gate passed while this was true. axe measures DOM contrast against declared
backgrounds and cannot see a canvas behind text; the responsive suite checks
overflow and tap targets. Only looking at the screenshot found it.

Fixed with `.hero-rail-scrim`: a vertical gradient over the bottom 42% of the
stage, opaque at the base and gone well above the rail, so the labels' contrast
never depends on which frame is showing.

## 27.2 Mobile LCP — four attempts, two kept

The target is < 2.5s. Starting point 2.92s median.

**First, a correct diagnosis.** Lighthouse's LCP is `TTFB 459ms + render delay
2472ms`. Instrumenting the page directly with a `PerformanceObserver` under 4×
CPU throttling and emulated slow 4G recorded LCP at **984ms**, identical to FCP —
so the element paints immediately and the 2.9s is Lantern's *simulation*, not an
observation. The lever is therefore critical-path weight and modelled main-thread
work, not the element itself.

| Attempt | Change | Result | Kept |
|---|---|---|---|
| 1 | Modern `browserslist` (chrome 111+, safari 16.4+) | `legacy-javascript` 300ms → 0–80ms | **yes** |
| 2 | Display serif `preload: false` — the LCP element is set in Inter, so preloading the serif put 15 KB on the critical path that the LCP gains nothing from | 15 KB off the critical path | **yes** |
| 3 | Inter `display: optional`, to stop the LCP text chaining behind a font download | Median unmoved over five runs, and it would leave slow-connection visitors on the fallback for their whole visit | **no — reverted** |
| 4 | `experimental.inlineCss` — the stylesheet was render-blocking, ~160ms plus a round trip | Median LCP 2.92s → **2.82s**; 0 stylesheet links, 8 KB inlined | **yes** |

**Result: 2.82s median. The 2.5s target is not met.** Three of the four ideas
were principled and two of them measurably helped; the remaining gap is dominated
by Lantern's simulated TTFB against `next start` on localhost, which a CDN
deployment addresses and which cannot be measured here.

Attempt 3 is recorded because it is the one that looked most promising and did
nothing. Taking a real UX cost for an unproven gain would have been the wrong
trade.

## 27.3 Final measurements

**Mobile, five runs:** 91, 91, 94, 94, 95 → **median 94**. LCP median 2.82s,
CLS 0.000, Accessibility / Best Practices / SEO 100.

**Desktop:** 100 / 100 / 100 / 100. LCP 0.7s, CLS 0.000.

```
axe 4.13.0            0 violations across 3 routes
responsive            12 viewport/route combinations, 0 findings
contrast              38 pairs, 0 failures
keyboard              0 focusable steps without a visible focus ring
console               0 errors on / and /resume
eslint                exit 0
secret scan           119 files, 10 rules, PASS
total page weight     307 KB  (JS 147, fonts 84, CSS 8, other 68)
```

**On the mobile median moving 95 → 94.** The same build measured 95 earlier in
this session. Run-to-run spread on identical builds was 86–95, and the host
degraded mid-session: OneDrive was the top CPU consumer, syncing the megabytes of
rendered frames written into the project directory. FCP on identical builds
swung between 0.9s and 1.8s. The difference between 94 and 95 is inside that
noise band and is not attributed to any change.

## 27.4 Sequence states reviewed

REST · DOCUMENT · EXTRACTION · RETRIEVAL · CONTEXT · ANSWER · FINAL, inspected as
rendered screenshots at 1440.

None reads as a paper advertisement, floating UI, generic CGI or a cyberpunk
interface. The sheet never leaves the desk, never separates and never floats;
its contact shadow is present in every frame. The only light source that moves is
the reading beam, and there is no bloom, no volumetric cone and no glow. Every
computational mark is printed into the page texture, so it takes the paper's
lighting and perspective and cannot detach into a HUD.

The final state holds a composition rather than emptying: name, role, both calls
to action, the marked-up document with its retrieved passage still warm, the
foot metadata, and the answer panel.

## 27.5 Widths reviewed

360 · 390 · 768 · 1024 · 1440 · 1920, hero and flagship at each.

- **360 / 390** — name, role, statement, both CTAs and the live-demo link all
  above the fold. No image, by the measurement in §26.5.
- **768** — single column, generous whitespace, rail in two columns. Sparse by
  intent rather than by accident; the sequence does not mount below 1024.
- **1024 / 1440 / 1920** — sheet in the right half, type never overlapped. The
  rail defect at these widths is the one fixed in §27.1.
