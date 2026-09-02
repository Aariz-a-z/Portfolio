# REVIEW.md — read as a hiring manager

Date: 2026-08-27

The frame: I have sixty portfolios and an afternoon. That is roughly four minutes
each, and most of them I close in twenty seconds. I am screening for AI/ML
interns and juniors. I am not reading carefully; I am looking for a reason to
open a repo, and failing that, a reason to close the tab.

---

## In five seconds, is it clear what he does?

**Yes.** Above the fold: the discipline line, the name at 56px, and one sentence
that names the actual work — retrieval and NLP systems, ingestion and embeddings
through to evaluation. There is no slogan, no "passionate", no rotating job
titles. The primary button says "Explore projects", which is where I want to go
anyway.

Beside the text there is a slow contour field that reacts to my cursor. I did not
expect to like it — most portfolio 3D is a rotating shape that tells me nothing —
but this one is legible: bright where points cluster, dim where they do not, and
it tightens around wherever I point. It reads as a distance field, which is what
the flagship project is about. It is also the only animated thing on the site,
which is why it works.

## Do the top two projects make me want to open the repo?

**One of them, strongly. The other, less than it should.**

The Resume Analyzer works on me. There is a real screenshot of real output —
match score, missing skills, a radar chart — and the description tells me the
mechanism rather than the vibe: sentence embeddings, cosine similarity, PDF text
extraction, an alias ontology so "ml" and "machine learning" collapse. I can tell
in fifteen seconds whether this person understands what an embedding is. That is
exactly what I want.

The RAG chatbot is the stronger of the two. Instead of a screenshot it shows an
architecture diagram of the actual pipeline — ingest, chunk, embed, pgvector,
hybrid search, rerank, generate — with a provider layer underneath that swaps
between a local and a hosted model. That is more useful to me than a picture of a
chat window would have been: I can see the shape of the system in about four
seconds, and it tells me he can describe his own architecture.

The copy is the best thing on the site. "Reranking is fail-open, so a broken
reranker returns the fused order rather than failing the request" is a sentence a
lot of senior engineers would not think to write.

## Does anything read as inflated, vague or template-generated?

**No, and unusually so.** A few things I actively noticed as a screener:

- Nothing claims impact. No "improved efficiency by", no invented percentages.
- "SQL — Basics" is labelled as basics. Almost nobody does that.
- The Travel Planner is described as PHP and MySQL rather than being dressed up
  as full-stack. The Python fundamentals are called fundamentals and get one line
  each rather than a card apiece.
- Two projects carry a metric and six do not, which reads as "these are the ones
  where a number means something" rather than as decoration.
- Both metrics state their evaluation basis. "R²: 0.525 (chronological 80/20
  hold-out)" tells me he knows why a random split would have been wrong on a time
  series. That single parenthesis is worth more than the number.

If anything the site under-sells. The 1,258 lines of hand-written SQL migrations
in the RAG project are not mentioned anywhere, and "SQL — Basics" is a
significant under-claim.

## Is there any claim he could not defend in an interview?

**I could not find one.** Every project description maps to code, and the
Truth Ledger makes that mapping explicit. Specific things I would have probed and
found already handled:

- The Iris project publishes no accuracy figure. Had it published 0.967, my first
  question would have been "how did you pick k?" — and the notebook shows k was
  selected on the test set. Leaving the number off removes the trap entirely.
- The stroke project makes no clinical claim and frames itself as an exercise on
  a public dataset.
- The RAG chatbot is marked in progress and describes what exists, not what is
  planned.
- The About section says a stroke dataset "will happily hand you 95% accuracy for
  a model that predicts nothing", which is both true and a signal that he
  understands the metric, not just the library.

## The three weakest things

### 1. The flagship has no visual — RESOLVED

The most important project on the site opens with an empty box. For a recruiter
who scrolls once and leaves, the first impression of "Featured work" is absence.

**Status: fixed.** The flagship now carries an inline SVG of the real pipeline —
ingest through pgvector through hybrid retrieval, rerank and generation, with the
provider layer that swaps Ollama for Gemini by environment variable. Every box
maps to a file in the repository.

A real screenshot is still not available: the app runs correctly and answers, but
its corpus is empty, and filling it means writing documents into your live
Supabase project, which I will not do unasked. `VERIFICATION.md` §16 has the
exact capture spec if you want one later. For an engineering reader the diagram
is arguably the better artifact anyway — it shows the architecture, which a chat
bubble would not.

### 2. Nothing on the site can be tried

Eight projects, zero live demos. Everything routes to GitHub, which means the
only way to evaluate the work is to read code — and at four minutes per
portfolio, I mostly will not. A single working link would change the character of
this site more than any other change available.

**Status: not something I can fix — it needs a deployment.** The highest-leverage
version is the RAG chatbot: its own commit history already includes a Vercel demo
mode, so it is closer to deployable than anything else here. The Resume Analyzer
on Streamlit Community Cloud is the cheaper second option. Adding `links.demo` to
a project object is then a one-line data change and the button appears
automatically.

### 3. The hero is sparse at desktop widths — RESOLVED

At 1440px and above, the right half of the first screen is empty. On a phone it
is fine. On a laptop it reads as a layout with a hole in it.

**Status: fixed.** The right column now holds the similarity field — a scalar
field over embedded points where proximity is drawn as light, and the pointer
acts as a query that re-weights it. It is the retrieval step of the flagship
project, drawn. Measured cost: 3.4 KB gzipped, desktop only.

It is deliberately the only animated thing on the site. Everything below the
hero is still static and editorial.

---

## Fixed during this pass

Three defects found by actually reading the rendered pages, and fixed:

1. **The status note appeared above the project title.** A reader met the
   sentence "Extending document ingestion to structured formats…" before learning
   which project it referred to. The badge now sits under the title as a label
   and the sentence moved below the summary, so the order is: what it is, that it
   is ongoing, what it does, what is in progress.

2. **The skills section made a claim that was not true.** The intro reads
   "Everything listed here is used in a project above", but VS Code was sourced
   from a resume line, not from any project. Removed — the claim is now true of
   every remaining entry. On a site whose entire argument is that nothing is
   inflated, a single unsupported chip is worth more than it costs.

3. **A blank band before the footer.** `content-visibility: auto` on below-fold
   sections was reserving 900px per section against real heights that differed
   widely, inflating the page from 4,838px to 6,707px and leaving a ~1,100px void
   in full-page renders. That also means the scrollbar changes length while
   reading, and print output would be wrong. Removed; the performance it bought
   was marginal.

---

## What I would tell him privately

The engineering judgment on display is well ahead of the résumé. The parts that
would make me call are the fail-open reranker, the similarity threshold chosen by
measurement rather than by feel, and the chronological hold-out — none of which
are things a student copies from a tutorial.

Two pieces of advice:

**Deploy something.** One working demo is worth more than the next three projects
he could build.

**The RAG project's own README says "Level 3 of 25 — retrieval does not exist
yet."** The git log says levels 0–23 are complete and the code agrees. A recruiter
who follows the link from this site lands on a README that describes a far
weaker project than the one in the repository. That is the single highest-value
thing to fix, it is outside this repo, and it is thirty minutes of work.

---

# V2 recruiter review — 2026-08-28

Same frame as before: sixty portfolios, an afternoon, four minutes each, most
closed inside twenty seconds.

## Five seconds in, is it obvious what he does and that he builds real systems?

**Yes, and the hero now earns its space.** Dark cinematic plate, name at 56px,
the discipline line above it, one sentence naming retrieval and NLP systems, and
both calls to action — all readable before I scroll anything. To the right sits a
photographed-looking printed page with bands lifting off it, one of them picked
out in a cool light.

The three labels underneath — DOCUMENT, CHUNKS, RETRIEVED — tell me what the
picture means without making me watch it. "Split on semantic boundaries at
roughly 600–900 tokens, with overlap" in the hero is an unusual thing to put in
front of a recruiter, and it works: it says this person knows the parameters of
his own system.

## Does the sequence explain something, or is it decoration with a story attached?

**It explains something.** Scrolling separates the page into overlapping bands
and lifts one out. That is chunking and retrieval, and it is the operation the
flagship project performs. The overlap between bands is visible, which is the
detail that makes it a diagram of something real rather than an animation.

I would not call it thrilling. It is one restrained idea done properly, which for
an engineering portfolio is the right trade. It does not loop, does not demand
attention, and stops when I scroll past.

## Would this be recognisable as derived from the reference site?

**No.** What was taken is at the level of principle — restraint, confidence in
type, generous whitespace, a single accent, pacing that lets things breathe. The
execution shares nothing: different subject matter, different composition,
different colour, different structure, a scroll-scrubbed rendered sequence rather
than a live scene. Someone who knows that site would not think of it here.

## Does anything read as template, over-animated, or hard to navigate?

No. There is exactly one animated moment on the entire site and it is in the
hero. Everything below is static and editorial. Navigation is a persistent bar
with Resume visible at every width. Nothing needs to be discovered.

The one thing I notice as a screener: the mobile hero has no image. It is
typography on a dark gradient. It looks deliberate rather than broken — but it
is plainer than the desktop, and someone comparing the two would see the
difference.

## Is there a single claim he could not defend in a technical interview?

**No, and the RAG project is now stronger.** Ten pipeline stages were each
required to produce a code path before they could be described, and all ten did.
The two an interviewer would drill into hardest — hybrid search and reranking —
have the most explicit evidence: the reciprocal rank fusion formula is literally
in the SQL migration, and reranking is a separate module operating over an
over-fetched candidate set.

The project is now marked completed with a Live Demo button, and I clicked it,
and it works. That changes the character of the whole site: it is the difference
between a portfolio I read and one I use.

Two verified metrics, both with their evaluation basis stated. No Iris number.
Nothing about the Resume Analyzer's accuracy. Still under-claimed if anything.

## The three weakest things

### 1. The mobile hero lost its cinematic image — RESOLVED as a deliberate trade

Seven measured attempts to keep a raster image in the mobile hero, and every one
of them either broke the 95 performance gate or made the image the largest
contentful paint, which the brief forbids outright. A full-bleed image always
beats a heading on painted area.

**Fixed by removing it and saying so.** Mobile is typography, the dark plate and
a CSS gradient — which scores 95 and keeps the heading as LCP. The full record of
all seven attempts is in `VERIFICATION.md` §24.4. It is a downgrade, and it is
the one the brief pre-authorised.

### 2. Nothing else on the site can be tried — PARTLY RESOLVED

One of eight projects now has a working demo, and it is the right one. The other
seven still route to GitHub only.

**Not something I can fix — it needs deployments.** The Resume Analyzer on
Streamlit Community Cloud is the cheapest next one; adding `links.demo` to its
object is a one-line data change and the button appears automatically.

### 3. The RAG repository's README still undersells the project badly

This is now the weakest link in the whole presentation and it is not on this
site. The portfolio says completed, deployed, nine document formats, hybrid
retrieval, reranking. A recruiter clicks through to GitHub and the README opens
with *"Status: Level 3 of 25 — connected to a local model."*

**Not fixed, because it is outside this repository and I do not change your
other repos unasked.** It is thirty minutes of work and it is worth more than
anything else remaining on this list.

## What I would tell him privately

The engineering judgment is still ahead of the résumé, and now the site shows it
twice: once in the copy, once in the fact that the hero visual is a correct
diagram of his own retrieval step rather than decoration.

The single highest-value action left is the README. The second is deploying the
Resume Analyzer. Neither is design work.

---

# V3 hero — recruiter review, 2026-09-01

Same frame as before: sixty portfolios, an afternoon, four minutes each, most
closed inside twenty seconds.

## Five seconds in

The hero now has a photograph-like object in it: a thick block of paper on a
dark table, lit from the right, with one sheet pulled out of the middle and lit
in blue. It reads instantly as a physical thing in a room, which the previous
version — flat white rectangles at an angle — did not.

Name at 56px, discipline line above, one sentence naming retrieval and NLP
systems, both calls to action, all readable before I scroll. Nothing sits over
the image.

## Does the sequence explain something?

**More than the last one did.** Scrolling pushes the camera in and draws one
sheet out of the block, then washes two bands onto it — the passage, and the tail
of the passage before it, overlapping. That last detail is the one that would
make me stop. Anyone can animate a highlight; drawing the *overlap between
adjacent chunks* is a thing you only put on screen if you know why chunks
overlap.

The three labels — Corpus, Retrieved, Chunk — now match the picture exactly.

## Is it still recognisable as derived from the reference site?

No. Restraint, confidence in type and a single accent are the only inheritance,
and the execution shares nothing.

## Could any claim not survive an interview?

No. The labels were re-derived against the code when the subject changed, and
"600–900 tokens with overlap" maps to constants in `chunking.ts`. Notably the
copy still says "chosen by cosine similarity" when retrieval is actually hybrid
with RRF — under-claiming, because the frame shows proximity and not fusion.

## The three weakest things

### 1. The mobile performance number is currently unproven — HONEST GAP

Mobile measured 86 median against a gate of 95. It was chased down rather than
reported either way: at mobile width the page makes **zero** requests to the
sequence, and the transferred payload is **296,363 bytes in all ten runs**,
identical before and after this change. The previous build measures 92 on this
same machine today, not the 95 it recorded originally.

**So the change is not responsible, and the gate is recorded as not
demonstrated rather than passed.** It needs a re-measure on a quiet machine or
against the deployed site. Desktop is 100 across all four categories.

### 2. Mobile still has no cinematic image — UNCHANGED, DELIBERATE

Typography on a dark gradient. The seven measured attempts behind that decision
are in `VERIFICATION.md` §24.4. A visitor comparing phone to laptop sees a
plainer hero on the phone.

### 3. The RAG repository's README still undersells the project — NOT FIXED

Still the weakest link in the whole presentation, and still not on this site.
The portfolio says completed, deployed, nine document formats, hybrid retrieval,
reranking. GitHub opens with *"Status: Level 3 of 25 — connected to a local
model."*

**Outside this repository, and I do not change your other repos unasked.** It is
thirty minutes of work and worth more than anything else remaining.

## What I would tell him privately

The hero finally carries its own weight: it is a correct diagram of his
retrieval step that also happens to look like a photograph. The chunk-overlap
detail is the single best thing on the page for a technical reader.

The highest-value action left is still the README, and it is not design work.

---

# V3 recruiter review — 2026-09-01

Same frame as before: sixty portfolios, an afternoon, four minutes each, most
closed inside twenty seconds.

## Five seconds in

**Yes, and it now looks expensive.** The eyebrow says AI / ML DEVELOPER in amber.
The name is set in a serif at 104px. Under it, one sentence in plain language —
"I build intelligent systems that turn data into useful answers" — then the
degree and the stack, then two buttons and a live demo link. To the right, a
photograph of a document on a desk with a light moving across it.

The single largest change is not the hero. It is that the page no longer breaks.
V2 was a black cinematic plate that gave way to a white card grid at the hero
boundary — a film, then a documentation site. The whole page is now one dark
environment, and that is what separates a designed site from a themed one.

## Does the 3D look like cards, plates or generic AI?

**No, and this is the first version I can say that about.** There is one sheet of
paper. It never separates, never floats, never becomes a deck. What moves is the
light. Three earlier attempts failed the same way because they all did the same
thing — took paper apart — and separated flat sheets are plates however they are
lit.

The computational marks are the part I did not expect to work. Brackets appear in
the margin as the light passes, each numbered. One passage takes an amber wash. A
caliper rule and a similarity figure appear beside it, and a line of metadata
sits at the foot of the page: token span, overlap, embedding width. They are
printed on the paper, in its lighting, taking its perspective — not floating in
front of it. Nothing glows. There is no HUD.

At a glance it is a beautifully lit document. Looked at properly, it is a machine
showing its working. That is the brief, and it lands.

## Is the 3D subordinate to the identity?

Yes. The name is the largest thing on screen by a wide margin, the type sits in
the left half on a scrim that never lets the image interfere, and both calls to
action are above the label rail. On mobile there is no image at all and the hero
loses nothing but the picture.

## Does anything read as template?

No. Four layout grammars now do the work one card grid used to: an editorial
spread for the flagship, ruled numbered rows for the standard projects, an
accent-ruled index for the compact ones, and a plain list for the fundamentals.
Skills is six typographic groups with accent rules, not a logo wall.

The flagship finally looks like a flagship. Four verified figures set as large
mono numerals on a rule are the most scannable proof on the site, and COMPLETED
is a word in the accent rather than a pill.

## Is there a claim he could not defend?

**No.** The pipeline rail gives a recruiter five words and an interviewer ten
rows, each naming the file that implements it. The two stages an interviewer
would drill hardest — hybrid search and reranking — have the most explicit
evidence, and the honest caveats are stated rather than buried: OCR works only in
hosted mode, reranking ships disabled because it improved nothing on the fixture
set.

One figure in the render, the similarity value, is illustrative rather than
measured, and the ledger says so at section 11.2.

## The three weakest things

### 1. Mobile LCP is 2.9s against a 2.5s target — and it got worse

V2 was 2.71s. The display serif is in the critical path and costs roughly that
difference. The score still holds at 95, and the trade buys the typography that
makes the page feel expensive, but it is a regression and it is recorded as one.

### 2. The mobile hero has no image, for the eighth measured time

Eight attempts across two rounds, every one either missing the performance gate
or making the image the largest contentful paint. A heading cannot out-paint a
photograph. Mobile is typography, and it looks deliberate — but someone comparing
a phone with a laptop sees two different levels of ambition.

### 3. Still only one project can be tried

The RAG chatbot is deployed and its demo works. The Resume Analyzer is the
cheapest next one; adding a demo URL to its object is a one-line data change and
the button appears automatically. Seven of eight projects still route to GitHub
only.

## What I would tell him privately

The site now looks like the work of someone who could be hired to design as well
as to build, which was not true of V2. The engineering judgment is still ahead of
the résumé, and the page finally shows that in its own craft rather than only in
its copy.

The highest-value action left is not on this site: deploy the Resume Analyzer.
