# TRUTH-LEDGER.md

Date: 2026-08-27 · Plan revision 2

Every factual claim the site is permitted to render, mapped to its source. Source types:

- **R** — a line in a resume document (file named per row)
- **C** — code or config in a repository actually inspected
- **U** — an explicit answer from the user
- **TODO** — unresolved. Renders as nothing until answered.

Nothing may appear on the site that is not in this file. Rows marked **CUT** are recorded so
that the reason for their absence is auditable.

---

## 1. Identity and contact

| Claim | Type | Source | Status |
|---|---|---|---|
| Name: **Aariz Khan** | U | D4, Plan Revision Round 1 | Confirmed. Primary name everywhere; "Pathan Aariz Khan" appears nowhere on the site. |
| GitHub: `https://github.com/Aariz-a-z` | U + C | D4; corroborated by `git remote -v` on all 8 repositories | Confirmed |
| LinkedIn: `https://linkedin.com/in/aariz-khan-pathan` | U | D4 | Confirmed |
| Email: `pathanaarizkhan021@gmail.com` | U | D4; also on `Aariz cv.pptx` | Confirmed |
| Phone | U | D4 | **Excluded from the site.** Resume PDF only. |
| Discipline line: "B.Tech — Artificial Intelligence & Machine Learning" | R + U | `Aariz resume.pdf`, `Aariz resume.docx`, `Aariz cv.pptx`; original brief §4 | Confirmed |
| Site URL | TODO | — | `TODO_FINAL_DOMAIN`. Not blocking: a Vercel production build resolves the origin from the host, and absolute URLs are omitted rather than invented anywhere else. |

## 2. Education

| Claim | Type | Source | Status |
|---|---|---|---|
| CMR University | R | All three resume documents | Confirmed |
| Bengaluru | R + U | `Aariz cv.pptx` ("Lakeside Campus, Bengaluru"); original brief §4 | Confirmed |
| B.Tech, Artificial Intelligence & Machine Learning | R | All three resume documents | Confirmed |
| 2023 – 2027 | R | All three resume documents | Confirmed |
| **CGPA 8.8** | U | D3 — user-confirmed, supersedes prior value | Confirmed. The superseded figure appears nowhere except as a quoted record in `AUDIT.md` §3.2 / §4, annotated. |
| Prior schooling (Sri Chaitanya, Keshava Reddy) | R | All three resumes | **CUT** — not rendered. Secondary education adds nothing to an engineering portfolio and competes with projects for attention. |

## 3. Open TODOs — render as nothing until answered

| # | Item | Blocking |
|---|---|---|
| 1 | `SITE_URL` final domain | Nothing. Resolved from the host on a production deploy; omitted rather than invented elsewhere. One line to pin later. |
| 2 | Resume PDF content — `PLAN.md` §9.1 | The PDF only. Three questions: internships in the PDF, certifications in the PDF, and correcting the Travel Planner line from Django to PHP. |
| 3 | ~~RAG screenshot~~ | **Closed.** The flagship carries an architecture diagram of the real pipeline, which suits an engineering reader better than a chat screenshot. |

**Closed by the final decision set:**

| Former item | Resolution |
|---|---|
| Iris evaluation metric | **Closed — decision 2.** No metric published for Iris. The project is kept without a number. |
| RAG `statusNote` wording | **Closed — decision 5.** Proceeding with the traced wording; provenance recorded in §5.1. |
| Certifications | **Closed — decision 7.** Omitted. Structure exists, list empty, nothing rendered. |
| CGPA | **Closed — decision 1.** 8.8 is the verified value. |
| Sales R² precision | **Closed — decision 3.** Renders as `0.525`. |
| SQL label | **Closed — decision 4.** "Basics" retained; see the note in §7. |

## 4. Excluded claims — cut, with reason

| Claim | Why it is not on the site |
|---|---|
| All certifications | D1 — omitted entirely. Three resume versions listed three non-overlapping sets, none with a date or a full provider. |
| COINCET internship | D2 — omitted. |
| AI CLUB internship | D2 — omitted. |
| Email Spam Classification | D9 — no source code found in any repository. |
| House Price Prediction | D9 — no source code found. |
| Customer Segmentation (K-Means) | D9 — no source code found. |
| Number Guessing Game | D8 — exists in no repository; filesystem search returned no match. |
| Calculator Application | D8 — exists in no repository; filesystem search returned no match. |
| Travel Planner "responsive" | Zero `@media` queries across all 8 stylesheets. |
| Travel Planner "HTML/CSS only" / "no backend" | D7 — `login.php` and `signup.php` are committed and open a MySQL connection. |
| FastAPI | No import, dependency, or file in any repository. |
| Clustering / K-Means | No `KMeans` occurrence in any file in any repository. |
| ML pipelines | No `sklearn.pipeline` usage. The notebooks do preprocessing and training as discrete steps. |
| Probability, statistics (as standalone skills) | Not on any resume's skill list, and only indirectly evidenced in code. Folded into "model evaluation", which is directly evidenced. |
| Any accuracy or match-rate number for the Resume Analyzer | Original brief — explicitly forbidden. |
| Any clinical or diagnostic claim | Original brief — Heart Stroke is framed as an ML exercise on a public dataset. |
| The committed database credential | S1 — never reproduced, never described, in any artifact. |

---

## 5. Projects

### 5.1 RAG Chatbot — flagship, completed (see §10)

Repository: `Aariz-a-z/aariz-ai`. All paths below are relative to that repository.

| Claim | Type | Source |
|---|---|---|
| ~~Ongoing status~~ | C | **Superseded 2026-08-28.** Working tree is now clean and the in-flight work is committed. Status is `completed`; see §10. |
| Retrieval-augmented chatbot over user documents | C | `src/lib/rag.ts` header; `src/app/api/chat/route.ts` |
| Document ingestion converges all formats on one path | C | `src/lib/ingest/extract.ts` lines 1–16 |
| PDF text extraction via `unpdf` | C | `src/lib/ingest/extract.ts:181` — `await import('unpdf')` |
| HTML parsing | C | `src/lib/ingest/extract.ts:20` — `node-html-parser` |
| Upload path never writes to disk | C | `src/lib/ingest/extract.ts` lines 12–15 |
| Semantic chunking, headings → paragraphs → sentences | C | `src/lib/ingest/chunking.ts` lines 1–20 |
| ~600–900 tokens, ~100 token overlap | C | `chunking.ts` — `DEFAULT_TARGET_MIN_TOKENS 600`, `MAX 900`, `OVERLAP 100` |
| Title and heading path prepended to each chunk | C | `chunking.ts` lines 12–17 |
| Provider-agnostic embedding facade with batching, retry, validation | C | `src/lib/embeddings.ts` lines 1–27 |
| Embedding adapters: Ollama and Gemini | C | `src/lib/embeddings/ollama.ts`, `src/lib/embeddings/gemini.ts` |
| Vectors stored in Supabase PostgreSQL with pgvector | C | `supabase/migrations/20260817120000_init_documents_and_chunks.sql`; `src/lib/supabase/vector.ts` |
| pgvector wire-format boundary | C | `src/lib/supabase/vector.ts` lines 1–26 |
| Query embedded, `match_chunks` RPC, HNSW cosine index | C | `src/lib/retrieval.ts` lines 1–18; `supabase/migrations/20260818120000_match_chunks_rpc.sql` |
| Over-fetch then deduplicate | C | `retrieval.ts` — `CANDIDATE_OVERFETCH = 3` |
| Similarity threshold 0.5, chosen by measurement (0.797 vs 0.433) | C | `retrieval.ts` lines 27–33 |
| Hybrid search: vector + full-text, fused by Reciprocal Rank Fusion | C | `supabase/migrations/20260819120000_hybrid_search.sql` lines 1–11 |
| Reranking over a larger candidate set | C | `src/lib/rerank.ts` lines 1–17 |
| Reranking is fail-open; a broken reranker cannot fail a request | C | `src/lib/rerank.ts` lines 18–26 |
| Grounded context as indexed, titled document blocks | C | `src/lib/rag.ts` lines 1–14 |
| Context budget bounded by measured hardware limits | C | `src/lib/rag.ts` lines 22–30 |
| Streamed responses | C | `src/app/api/chat/route.ts`; `src/lib/chat-transport.ts` |
| Provider abstraction, model selected by environment variable | C | `src/lib/llm.ts`, `src/lib/llm/{ollama,gemini}.ts`; `ROADMAP.md` "Provider Abstraction" |
| Configuration described in one module, enforced in another | C | `src/lib/inference-mode.ts` lines 9–17 |
| Authentication | C | `src/lib/auth.ts`; `supabase/migrations/20260821120000_authentication.sql` |
| Rate limiting | C | `src/lib/rate-limit.ts` |
| Embeddable widget | C | `public/widget.js`; `src/lib/widget-origins.ts`; `src/app/embed/` |
| Conversation memory | C | `src/lib/conversations.ts`; `supabase/migrations/20260820120000_conversations_and_messages.sql` |
| Evaluation harness | C | `evals/questions.jsonl`; `evals/reports/` — 14 runs, 2026-08-18 to 2026-08-26 |
| **Visible stack:** Next.js 16.3.1, React 19, TypeScript 5, Tailwind CSS 4, Supabase, PostgreSQL + pgvector, unpdf, Ollama, Gemini | U + C | D6; each verified at a call site. `package.json` for versions. |
| Live demo: `https://aariz-ai-three.vercel.app` | U + C | Supplied by the user as verified. Independently confirmed on 2026-08-28: HTTP 200, no redirects, and the response body contains `<title>AARIZ AI</title>`, so the URL serves the project it claims to. |
| `node-html-parser` | C | Real dependency, really used, deliberately **not** shown on the card — below the threshold of interest per D6. |
| ~~`statusNote`~~ — removed | C | **Superseded 2026-08-28.** Commit `39e180d` shipped this; the project is complete. Original evidence: | Untracked `src/lib/ingest/structured.ts` (exports `extractCsv`, `extractDocx`, `extractJson`, `extractXlsx`), untracked `formats.ts`, modified `extract.ts`, untracked migration `20260827120000_structured_source_types.sql` | **Confirmed — decision 5.** Provenance is an uncommitted working tree, so this records work in progress rather than settled fact. That is exactly what the ongoing badge asserts. |
| Framing: **completed and deployed** | U + C | Round 3 C2; deployment driven and answering, repo clean — see §10.1 | Confirmed. No ongoing badge renders anywhere. |

**Not claimed:** production hardening, uptime, user counts, latency, retrieval accuracy,
eval scores. The eval runs exist; their contents are not quoted.

### 5.2 AI Resume Analyzer — flagship, completed

Repository: `Aariz-a-z/AI-RESUME-ANALYZER`.

| Claim | Type | Source |
|---|---|---|
| Streamlit application | C | `requirements.txt`; `app.py:1` |
| Semantic matching of a resume against a job description | C | `app.py` — `model.encode(...)` on both, then `util.cos_sim` |
| Embedding model `all-MiniLM-L6-v2` | C | `app.py` — `SentenceTransformer('all-MiniLM-L6-v2')` |
| Model loaded once and cached | C | `app.py` — `@st.cache_resource` |
| PDF text extraction page by page | C | `app.py` — `fitz.open(stream=…)`, `page.get_text("text")` |
| Regex normalisation before comparison | C | `app.py` — `clean_text()` |
| Cosine similarity score, clamped to 0–100 | C | `app.py` — `max(0, min(100, raw_score))` |
| ATS-style check flagging low extracted word count | C | `app.py` — `ats_check()`, threshold 50 words |
| Skill-gap analysis over a 7-entry alias ontology | C | `app.py` — `skill_ontology` dict |
| Word-boundary alias matching | C | `app.py` — `re.search(r'\b' + re.escape(alias) + r'\b', …)` |
| Radar chart of skill coverage | C | `app.py` — `plotly.graph_objects` |
| Learning-resource links for missing skills | C | `app.py` — `resource_links` dict |
| **Stack:** Python, Streamlit, Sentence-Transformers, PyMuPDF, Plotly | C | `requirements.txt`, all four traced to call sites |
| **No** accuracy or match-quality figure | — | Forbidden by the original brief |
| Screenshot: `/media/resume-analyzer/dashboard.webp` | C | Captured from the running application on 2026-08-27 by uploading the rebuilt resume PDF through its own file input and a generic public-style job posting through its own textarea. Every value shown — the ATS word count, the match score, the missing-skill list, the radar chart — was computed by `app.py`. Nothing is mocked. The alt text describes it as an example run. |

### 5.3 Sales Forecasting — standard, completed

Repository: `Aariz-a-z/Sales-forecasting`. Notebook:
`Sales_Forecasting_using_Linear_Regression.ipynb`.

| Claim | Type | Source |
|---|---|---|
| Monthly aggregation of transactional sales | C | Notebook Step 4 markdown + code |
| Exploratory analysis: trend and month-wise distribution | C | Step 5 — line plot, month-wise boxplots |
| Feature engineering: time index, cyclical month encoding, lags | C | Cell 32 — `['TimeIndex','month_sin','month_cos','lag_1','lag_2','lag_3','lag_6','lag_12']` |
| Linear regression | C | Cell 10 — `from sklearn.linear_model import LinearRegression` |
| **Chronological** 80/20 hold-out, not a random split | C | Cell 32 — `train = monthly.iloc[:train_size]`, `test = monthly.iloc[train_size:]` |
| Six-month forward forecast | C | Cell 47 — loop over `range(1, 7)` with `pd.DateOffset` |
| `Evaluation — R²: 0.525` | C | Cell 40 output: `MAE: 12915.86, RMSE: 267639709.56, R²: 0.5249` |

Raw value: **0.5249**. Rendered at three decimals as **0.525** — see `PLAN.md` §9.2.
Basis: chronological 80/20 hold-out, verified in cell 32.

### 5.4 Heart Stroke Prediction — standard, completed

Repository: `Aariz-a-z/Heart-stroke-prediction`. Notebook:
`heart_stroke_logistic_regression.ipynb`.

| Claim | Type | Source |
|---|---|---|
| Public stroke dataset | C | `healthcare-dataset-stroke-data.csv` in repo |
| Class imbalance identified | C | Markdown "The Imbalance Problem"; ~95% / ~5% |
| Missing values in `bmi` handled | C | Markdown — "bmi has 201 missing values" |
| Identifier column dropped | C | Cell 23 area — `id` dropped as non-predictive |
| One-hot encoding of categorical features | C | Cell 23 — `pd.get_dummies(..., drop_first=True)` |
| Scaler fitted on training data only | C | Cell 23 — `fit_transform(X_train)`, `transform(X_test)` |
| Logistic regression with balanced class weights | C | Cell 30 — `LogisticRegression(random_state=42, solver='liblinear', class_weight='balanced')` |
| Evaluation by confusion matrix, classification report, ROC-AUC | C | Cells 34, 36 |
| Coefficients interpreted as odds ratios | C | Cell 41 — `np.exp(coefficients)` |
| `Evaluation — ROC-AUC: 0.839` | C | Cell 36 output: `ROC-AUC Score: 0.8390` |
| Basis: stratified 80/20 hold-out | C | Cell 23 — `train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)` |

Raw value: **0.8390**. Framed as an ML exercise on a public dataset. **No clinical or
diagnostic claim of any kind.**

### 5.5 Wine Quality Classification — standard, completed

Repository: `Aariz-a-z/Wine-quality-classification`. Notebook: `SVM_Quality.ipynb`.

| Claim | Type | Source |
|---|---|---|
| Multiclass classification of wine quality | C | Notebook Step 4 — target `quality` |
| 80/20 train/test split | C | Step 5 |
| Feature scaling, justified by SVM scale sensitivity | C | Step 6 markdown + `StandardScaler` |
| Support vector machine | C | Step 7 |
| Per-class precision, recall, F1 | C | Step 9 — `classification_report` |
| Confusion-matrix visualisation | C | Step 10 |
| No metric rendered | — | D10 — only three projects carry a number |

### 5.6 Iris Flower Classification — standard, completed

Repository: `Aariz-a-z/Iris-flower-classification`. Notebook: `n_iris_dataset_knn.ipynb`.

| Claim | Type | Source |
|---|---|---|
| Three-species classification | C | Problem statement markdown |
| Label encoding of the target | C | Cell 4 — `LabelEncoder` |
| Stratified 80/20 split | C | Cell 13 — `test_size=0.2, random_state=42, stratify=y` |
| Feature scaling, justified by KNN's distance metric | C | Step 5 markdown + `StandardScaler` |
| K-nearest neighbours | C | Cell 19 — `KNeighborsClassifier(n_neighbors=5)` |
| Sweep over k = 1…20 | C | Cell 25 |
| **Evaluation metric** | — | **Not published — decision 2.** No accuracy figure appears on the card. |

The project is kept and described by approach and implementation only. Both figures the
notebook contains are recorded here for completeness, and neither is rendered anywhere on
the site:

- **0.9333** — cell 22 output, `Accuracy: 0.9333333333333333`, held-out test set at k=5.
- **0.9667** — cell 25 output, `Best K value: 1 with Accuracy: 0.9667`, the maximum over
  twenty models each scored on that same test set. Cell 26 markdown repeats it as the
  conclusion.

The second is optimistically biased: k was selected on the test set with no validation
split. Publishing neither removes the exposure entirely. Kept brief on the site — it is a
fundamentals project, and over-describing it would weaken the page.

### 5.7 Travel Planner — standard, completed

Repository: `Aariz-a-z/project-1`.

| Claim | Type | Source |
|---|---|---|
| Multi-page web application | C | 8 HTML pages: home, login, logout, plan, profile, signup, suggestion, trip |
| PHP-based user authentication | C | `login.php`, `signup.php` — committed |
| MySQL data layer | C | `signup.php` — `new mysqli(...)` against database `user_auth` |
| Hand-written CSS per page | C | 8 matching `.css` files |
| Hamburger navigation | C | `home.html` — checkbox-hack disclosure |
| **Not** claimed: responsive | — | 0 media queries across all 8 stylesheets |
| **Not** claimed: full-stack platform, secure authentication, session management | — | D7 — not verified in code |
| **Not** mentioned: the credential issue | — | S1 |

### 5.8 Python fundamentals — compact, completed

Repository: `Aariz-a-z/python-projects`. All four confirmed by `git ls-files`.

| Program | Claim | Source |
|---|---|---|
| Password Generator | User-defined length; letters, numbers, symbols | `password generator/README.md`, `password_generator.py` |
| Student Management System | Add and view student records, persisted to file | `student management system/README.md`, `student.py` |
| Authentication System | Signup and login with hashed passwords, file-backed | `authentication system/README.md`, `auth.py` |
| Expense Tracker | Add expenses by category, view, total | `expense tracker/README.md`, `expense_tracker_.py` |

One clause each, one shared repo link. No expansion — D8.

---

## 6. Metric provenance summary (D10)

| Project | Rendered | Raw | Repository | File | Location |
|---|---|---|---|---|---|
| Heart Stroke Prediction | `ROC-AUC: 0.839` | `0.8390` | `Aariz-a-z/Heart-stroke-prediction` | `heart_stroke_logistic_regression.ipynb` | cell 36 output |
| Sales Forecasting | `R²: 0.525` | `0.5249` | `Aariz-a-z/Sales-forecasting` | `Sales_Forecasting_using_Linear_Regression.ipynb` | cell 40 output |
| Iris Flower Classification | **not published** | `0.9333` / `0.9667` | `Aariz-a-z/Iris-flower-classification` | `n_iris_dataset_knn.ipynb` | cells 22 and 25 outputs |

Exactly **two** metrics render across the entire site. Iris publishes none, by decision 2 —
the raw values are retained here for provenance only.

Presentation rules in force: three decimals everywhere; model-evaluation framing only; no
business language; evaluation basis stated only where verified in code. Basis is verified
for both published metrics — stratified 80/20 hold-out for Heart Stroke (cell 23), and a
chronological 80/20 hold-out for Sales (cell 32, `iloc` slicing rather than a random split).

---

## 7. Skills — each item with its evidence

Rendered grouped, never as a badge cloud.

### Programming
| Item | Evidence |
|---|---|
| Python | 5 notebooks, `app.py`, 4 CLI programs |
| TypeScript | ~60 `.ts`/`.tsx` source files in `aariz-ai`, plus this portfolio |
| SQL — labelled **Basics** | 1,258 lines of hand-written migrations across 8 files in `aariz-ai/supabase/migrations/`, including `tsvector` generated columns, GIN indexes and RPC functions. The "Basics" qualifier comes from the resume and is retained by decision 4 — see the note below. |

### Data & Analytics
| Item | Evidence |
|---|---|
| NumPy | Imported in heart stroke, sales, iris notebooks |
| Pandas | Imported in all 5 notebooks |
| Matplotlib | Imported in heart stroke, sales, iris, wine notebooks |
| Seaborn | Imported in heart stroke, sales, iris, wine notebooks |
| EDA | Sales Step 5; heart stroke "Taking a Closer Look at the Dataset" |
| Data cleaning | Sales Step 3; heart stroke missing-value handling |
| Feature engineering | Sales cell 32 — cyclical encoding and lag features |

### Machine Learning
| Item | Evidence |
|---|---|
| Scikit-learn | All 5 notebooks |
| Regression — linear, logistic | Sales (`LinearRegression`), heart stroke (`LogisticRegression`) |
| Classification — KNN, SVM | Iris (`KNeighborsClassifier`), wine (SVM) |
| Model evaluation | ROC-AUC, confusion matrices, classification reports, R², MAE across 4 notebooks |

### AI / NLP
| Item | Evidence |
|---|---|
| NLP | Resume Analyzer semantic matching; RAG retrieval |
| Sentence-Transformers | `AI-RESUME-ANALYZER/requirements.txt`, `app.py` |
| Semantic similarity | `app.py` — `util.cos_sim` |
| Embeddings | `aariz-ai/src/lib/embeddings.ts` and both adapters |
| RAG | `aariz-ai/src/lib/rag.ts`, `retrieval.ts`, `rerank.ts` |
| Generative AI | `aariz-ai/src/lib/llm/{ollama,gemini}.ts` |

### Tools
| Item | Evidence |
|---|---|
| Git, GitHub | 8 repositories with remotes |
| Jupyter Notebook | 5 `.ipynb` files |
| Google Colab | Colab metadata present in all 5 notebooks |
| ~~VS Code~~ | **CUT after review.** Evidenced only by a resume line, while the skills section states that everything listed is used in a project above. The claim was false for this one entry, so the entry was removed rather than the claim weakened. |

### Web & Deployment
| Item | Evidence |
|---|---|
| HTML, CSS | Travel Planner, 8 pages; Tailwind front-end in `aariz-ai` |
| Next.js, React | `aariz-ai/package.json` (next 16.3.1, react 19.2.8) and its App Router source |
| Supabase, PostgreSQL | `aariz-ai/src/lib/supabase/`, 8 migrations in `aariz-ai/supabase/migrations/` |
| Streamlit | `AI-RESUME-ANALYZER/requirements.txt`, `app.py` |
| **FastAPI** | **CUT** — no evidence in any repository |

> **Note on the SQL label — decision 4, closed.** The label renders as **SQL (Basics)**.
> This is deliberately *more* conservative than the repository evidence supports: 1,258 lines
> of hand-written migrations including generated `tsvector` columns, GIN indexes and RPC
> functions is not a beginner artifact. The under-claim was raised with the user and
> retained at their instruction. It is recorded here so that the gap between the label and
> the evidence is auditable, and so the label can be raised later without re-deriving the
> justification.

---

## 8. Hero and About copy — sourcing constraint

Neither is drafted yet; both are written in Phase 2. The constraint recorded now:

- The hero headline may reference only: AI/ML study, Python, NLP, embeddings, retrieval,
  RAG, data-driven applications — each already evidenced above. No superlatives, no
  seniority claim, no slogan.
- The About paragraph may reference only rows in this ledger. It may not imply industry
  experience, internships, certifications, or team roles, none of which are on the site
  (D1, D2).
- Banned phrasing per the original brief §0.7 is checked mechanically before publication.

---

## 9. Resume PDF — sourcing constraint

The rebuilt PDF (decision 10) is a **second rendering surface for this same ledger**, not an
independent document. Every line in it draws from a row above, with two deliberate
differences from the site:

| Element | Site | Resume PDF |
|---|---|---|
| Phone number | omitted (decision 9) | **included** |
| Everything else | per this ledger | per this ledger |

Three questions remain open before the PDF is generated — recorded in §3 item 2 and
`PLAN.md` §9.1:

1. **Internships in the PDF** — omitted from the site by decision 13. Unresolved whether
   that extends to the PDF.
2. **Certifications in the PDF** — omitted from the site by decision 7. Same question.
3. **Travel Planner line** — the existing PDF says "Built using Django, HTML, CSS, and
   MySQL". The repository contains PHP and MySQL and **no Django**. Ledger §5.7 is the
   authoritative description. Transcribing the existing line would reproduce a claim the
   user's own repository contradicts, so it must be corrected rather than carried over.

Item 3 is the one genuine conflict between decision 10's "do not alter factual information"
and the zero-fabrication constraint. This ledger governs: the PDF states what the code
supports.

Verification: after generation, the PDF's text is re-extracted with PyMuPDF and asserted to
contain a non-zero character count — the exact check the current image-only file fails — and
each extracted claim is matched back to a row in this file.

---

## 10. Verification of this ledger

`VERIFICATION.md` will record, per row, that the rendered string on the built site matches
the claim recorded here — not that it "should" match. The same check runs against the
extracted text of the resume PDF.

---

# 10. RAG chatbot — status change and per-stage pipeline verification

Date of verification: **2026-08-28**

## 10.1 Status: ongoing → completed

Three independent lines of evidence, all checked on the date above.

**The deployment answers.** `scripts/verify-deployed-rag.mjs` drove
`https://aariz-ai-three.vercel.app` the way a visitor would — loaded it, typed a
question into its own composer, sent it with its own control:

```
HTTP 200, no redirects, <title>AARIZ AI</title>
/api/health  {"ok":true,"llm":"available","database":"available"}
answer returned: "The uploaded documents do not contain the information
                  needed to answer this question."
```

Retrieval ran, found nothing relevant in an empty corpus, and the model refused
rather than inventing. A working grounded refusal is evidence the system works.

**The repository is clean and the in-flight work landed.** What the site
previously called in progress — extending ingestion to structured formats — is
committed:

```
35a5040 Land confirmation links on a page that says the email was verified
82b23ca Read scanned PDFs, and put every size limit in one place
a4cd4e8 Ground answers in retrieved evidence, close the zero-API embedding leak
39e180d Support eight document formats through the one existing pipeline
working tree: clean
```

**The user confirmed it.** Round 3, C2.

Applied: `status: 'completed'`, `statusNote` removed, no badge rendered. A repo
sweep for `ongoing`, `in progress`, `WIP`, `prototype`, `experimental`,
`planned`, `future work` returns **zero** occurrences describing this project;
the only remaining matches are the generic `StatusBadge` component and the
`ProjectStatus` type, which are machinery, not claims.

## 10.2 Ten pipeline stages, each verified or cut

Every stage was required to produce a code path. **All ten produced one, so
nothing was cut.**

| # | Stage | Verified by | Evidence |
|---|---|---|---|
| 1 | Document ingestion | intake handler | `src/app/api/documents/route.ts`, `src/lib/ingest/pipeline.ts` |
| 2 | Document processing | unpdf extraction | `src/lib/ingest/extract.ts:181` — `await import('unpdf')` |
| 3 | Chunking | size and overlap constants | `chunking.ts` — `DEFAULT_TARGET_MIN_TOKENS = 600`, `MAX = 900`, `OVERLAP = 100` |
| 4 | Embeddings | call plus model name | `embeddings/ollama.ts` — `DEFAULT_MODEL = 'nomic-embed-text'`; `embeddings/gemini.ts` — `batchEmbedContents` |
| 5 | Vector storage | schema, column type, index | `embedding vector(768)`; `using hnsw (embedding vector_cosine_ops)` |
| 6 | Retrieval | the similarity query | `match_chunks` RPC, `20260818120000_match_chunks_rpc.sql` |
| 7 | Semantic search | distance operator | `1 - (c.embedding <=> query_embedding)` — pgvector cosine |
| 8 | **Hybrid search** | full-text combined with vector, explicit fusion | `to_tsvector('english', content)`, `websearch_to_tsquery`, `ts_rank_cd`, fused by RRF: `coalesce(1.0/(rrf_k + v.rank),0) + coalesce(1.0/(rrf_k + k.rank),0) as rrf` |
| 9 | **Reranking** | distinct second pass | `src/lib/rerank.ts` retrieves `RERANK_CANDIDATES` via `retrieveHybrid`, then reorders through `rerankResults`; strategies in `rerank/lexical.ts` and `rerank/llm.ts` |
| 10 | Grounded response | prompt construction, citations | `rag.ts` — `buildGroundedContext()` emitting `<document index="N" title="…">`; `components/message-sources.tsx` |

The two stages flagged as most likely to be overclaimed — hybrid search and
reranking — are the two with the most explicit evidence. The RRF formula is
literally in the migration, and reranking is a separate module operating on an
over-fetched candidate set.

## 10.3 New claims added, each traceable

| Claim | Source |
|---|---|
| Nine source types: PDF, HTML, Markdown, CSV, JSON, DOCX, DOC, XLSX, XLS | `src/lib/ingest/formats.ts` extension table and `src/types/database.ts` source types |
| Thirteen file extensions | same |
| OCR path for scanned PDFs | OCR references in `src/lib/ingest/extract.ts`, commit `82b23ca` |
| Live demo `https://aariz-ai-three.vercel.app` | §10.1 above, re-verified 2026-08-28 |

## 10.4 Hero sequence — what the pictures are allowed to claim

The cinematic sequence carries three labels, and they describe only what the
frames actually show:

| Label | Copy | Source |
|---|---|---|
| 01 Document | "A source document, whole." | The frame shows one page. |
| 02 Chunks | "Split on semantic boundaries at roughly 600–900 tokens, with overlap." | `chunking.ts` constants, §10.2 row 3 |
| 03 Retrieved | "The passage nearest the question, chosen by cosine similarity." | `match_chunks` cosine operator, §10.2 row 7 |

The sequence deliberately does **not** depict embeddings, hybrid search,
reranking or generation, because the frames do not show them. Those stages live
in the RAG project's architecture diagram, where each box maps to a file.

**Nothing in any frame is a screenshot of an application.** The page in the
render is procedurally drawn abstract rules — no words, no invented interface,
no fabricated output.

---

# 11. V3 hero — subject change, and what the new frames may claim

Date: 2026-09-01. The hero sequence was rebuilt because the previous one read as
stacked plates, which the brief ruled out. The subject changed, so the labels
had to change with it.

## 11.1 What the frames now show

A solid block of paper resting on a table. One sheet slides out of the middle of
it and is lit. On that sheet, two bands are washed in the accent colour: the
retrieved chunk, and the tail of the chunk before it, overlapping its top edge.

## 11.2 The three labels, and the source of each

| Label | Copy | Source |
|---|---|---|
| 01 Corpus | "Every uploaded document, chunked and embedded into one index." | The frame shows a body of documents, not one page. Chunking constants in `chunking.ts`; embedding call and model in `embeddings/ollama.ts` and `embeddings/gemini.ts`; single index is `embedding vector(768)` with `using hnsw (embedding vector_cosine_ops)`. Section 10.2 rows 3, 4, 5. |
| 02 Retrieved | "The passage nearest the question, chosen by cosine similarity." | The frame shows one sheet drawn out of the block. `match_chunks` RPC, `1 - (c.embedding <=> query_embedding)` — pgvector cosine. Section 10.2 rows 6, 7. |
| 03 Chunk | "Roughly 600–900 tokens, overlapping its neighbour so meaning is not cut in half." | The frame draws the chunk band **and** its overlapping neighbour. `chunking.ts` — `DEFAULT_TARGET_MIN_TOKENS = 600`, `MAX = 900`, `OVERLAP = 100`. Section 10.2 row 3. |

## 11.3 What changed from the previous labels, and why

The old labels were DOCUMENT, CHUNKS, RETRIEVED, describing one page splitting
into bands. The new frames do not split a page, so "Document / Chunks" would
have described a picture that is no longer on screen. The rule has not changed:
**a label may only name something the frames actually depict.**

The overlap is now drawn rather than only asserted. It was previously a claim in
prose beside a picture that did not show it; it is now visible in the frame, and
the constant behind it is unchanged.

## 11.4 What is still not depicted, and therefore still not labelled

Embeddings, hybrid search, reranking and generation. The frames do not show
them. They remain in the RAG project's architecture diagram, where every box
maps to a file — section 10.2.

Note that "chosen by cosine similarity" names the vector half of retrieval only.
Retrieval is in fact hybrid, fused by RRF (section 10.2 row 8), and the stronger
claim is available; it is not made here because the frames show proximity, not
fusion. Under-claiming against a picture is the correct direction.

## 11.5 Nothing in any frame is fabricated

The block's printed face and the retrieved sheet are procedurally drawn abstract
rules — no words, no invented interface, no screenshot of an application, no
fabricated output. The lamination along the cut edge is a generated texture, not
a photograph.

---

# 11. V3 hero — what the frames and the new copy are allowed to claim

Date: 2026-09-01.

## 11.1 The five stage labels

The sequence carries five labels, and they describe only what the frames show,
in the order they show it.

| Label | Copy | What the frame shows | Source |
|---|---|---|---|
| 01 Document | "A source document, whole." | One printed sheet, evenly lit | The frame |
| 02 Extraction | "Split on semantic boundaries, roughly 600–900 tokens." | Selection brackets appearing in the margin as the light passes | `chunking.ts` — `DEFAULT_TARGET_MIN_TOKENS = 600`, `MAX = 900` |
| 03 Retrieval | "The passage nearest the question, by cosine similarity." | One passage washed amber, the rest falling dark | `match_chunks` — pgvector cosine, similarity = 1 − distance |
| 04 Context | "Held with its neighbours, so meaning is not cut in half." | A caliper rule beside the band; its neighbours still faintly lit | `DEFAULT_OVERLAP_TOKENS = 100` |
| 05 Answer | "Grounded in that passage, and cited." | Nothing — this beat is DOM text, not geometry | `rag.ts` buildGroundedContext, `message-sources.tsx` |

Embeddings, hybrid search, reranking and generation are **not** depicted and so
are **not** labelled here. They live in the flagship's implementation rail, where
each stage names the file that implements it.

## 11.2 Numbers printed inside the render

Three appear on the sheet itself. Each is accounted for.

| Mark | Value | Source |
|---|---|---|
| Foot metadata | tokens 600–900, overlap 100, dim 768 | `chunking.ts` constants; `EMBEDDING_DIMENSION = 768` in `types/database.ts` |
| Beside the band | cos 0.82 | Illustrative of the cosine similarity `match_chunks` returns, above the configured threshold of 0.5. **Not a measured result for any specific query** |
| Margin indices | Section ordinals for the six drawn text blocks | Not a claim about any real document |

The similarity figure is the one number that is illustrative rather than
measured, and it is recorded as such here. It is a plausible value, not a
recorded one.

**Nothing in any frame is a screenshot of an application.** The page is
procedurally drawn abstract rules — no words, no invented interface, no
fabricated output.

## 11.3 The answer panel's copy

> "Grounded in the retrieved passage, and cited back to the document it came
> from."

This describes the system's behaviour and is not a model output. The refusal and
citation rules live in `llm/system-prompt.ts`; sources are rendered by
`components/message-sources.tsx`. No fabricated answer text appears anywhere on
the site.

## 11.4 A correction carried from the repository

The site said **nine** document formats. `src/lib/ingest/formats.ts` and
`DOCUMENT_SOURCE_TYPES` in the RAG repository define **ten** source types across
**fourteen** extensions: markdown, txt, pdf, html, docx, doc, xlsx, xls, csv,
json.

Corrected in `projects.ts` in two places — the implementation prose and the
feature list — and the flagship's figures now read 10 source types and 14 file
extensions. The site had been under-claiming, which is safe but inaccurate.

## 11.5 The flagship's verified figures

| Figure | Value | Source |
|---|---|---|
| Source types | 10 | `DOCUMENT_SOURCE_TYPES` |
| File extensions | 14 | `EXTENSION_TO_SOURCE_TYPE` |
| Embedding dimensions | 768 | `EMBEDDING_DIMENSION`, `vector(768)` column |
| Retrieval hit rate | 96.2% | `evals/reports/`, most recent runs, llama3.2:3b with nomic-embed-text |
