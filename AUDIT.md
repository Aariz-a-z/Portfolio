# AUDIT.md — Phase 0, read-only

Date: 2026-08-27
Scope: `C:\Users\yaheya khan\OneDrive\Documents\hacker\Desktop\Aariz Portfolio`, plus every
source repository and resume artifact referenced by the brief.

This document reports only. No fixes and no recommendations, per §1 of the brief.

---

## 0. Headline finding

**The target directory is empty. There is no existing portfolio repository.**

```
$ ls -la "Aariz Portfolio"
total 16
drwxr-xr-x  .
drwxr-xr-x  ..
```

Directory created `2026-08-27 15:27`. Zero files, zero subdirectories, no `.git`, no
`package.json`, no `node_modules`.

A search for any directory matching `*portfolio*` across `OneDrive/Documents`, `Documents`,
`Downloads`, `Desktop`, `OneDrive/Desktop` and `HTML` returned exactly one hit: this empty
folder.

The following requested audit items therefore have no subject matter. They are recorded as
N/A rather than guessed at:

| Requested audit item | Status |
|---|---|
| Framework, language, build tool, package manager, versions | N/A — no project |
| Folder structure and routing model | N/A — no project |
| Existing components and pages, keep / refactor / replace | N/A — none exist |
| Styling system, Tailwind config, tokens, theme handling | N/A — none exist |
| Animation approach, motion libraries installed | N/A — none exist |
| Where project / skill / contact content currently lives | N/A — none exists |
| Current responsive behaviour and breakpoints | N/A — none exists |
| Dependency list (used / unused / duplicated / heavy) | N/A — no manifest |
| Existing a11y and SEO state | N/A — no pages |
| Baseline build / typecheck / lint / console / dead links | N/A — nothing to build |

Constraints §0.5 ("don't demolish working code"), §0.6 ("no feature removal, especially the
resume viewer") and the instruction to reuse existing components have no existing code to
protect. This is a greenfield build, not an upgrade.

What does exist, and what the rest of this audit covers, is the **source material**: eight
project repositories on disk and three mutually inconsistent resume documents.

---

## 1. Toolchain baseline (host machine)

Verified by direct invocation:

| Tool | Version |
|---|---|
| Node.js | v22.15.0 |
| npm | 10.9.2 |
| git | 2.52.0.windows.1 |
| Python | 3.10.5 |
| OS | Windows 11 Home Single Language 10.0.26200 |

Python libraries present and used during this audit: `fitz` (PyMuPDF), `pypdf`. Not
present: `PyPDF2`, `pdfplumber`.

No lockfile, `.nvmrc`, `.node-version` or CI configuration exists in the target directory.

---

## 2. Source repositories on disk

All eight live under `OneDrive\Documents\hacker\Desktop\`. Every one is a git repository
with an `origin` remote on GitHub under the account `Aariz-a-z`.

| # | Project | Local folder | GitHub remote | Commits |
|---|---|---|---|---|
| 1 | RAG Chatbot ("AARIZ AI") | `AI Chatbot RAG` | `Aariz-a-z/aariz-ai` | 7 |
| 2 | AI Resume Analyzer | `AI RESUME ANALYZER` | `Aariz-a-z/AI-RESUME-ANALYZER` | 2 |
| 3 | Sales Forecasting | `Sales forecasting` | `Aariz-a-z/Sales-forecasting` | 1 |
| 4 | Heart Stroke Prediction | `Heart stroke prediction` | `Aariz-a-z/Heart-stroke-prediction` | 1 |
| 5 | Wine Quality Classification | `Wine quality classification` | `Aariz-a-z/Wine-quality-classification` | 1 |
| 6 | Iris Flower Classification | `Iris flower classification` | `Aariz-a-z/Iris-flower-classification` | 1 |
| 7 | Travel Planner | `project 1\frontend travel planner project` | `Aariz-a-z/project-1` | 1 |
| 8 | Python projects set | `python projects` | `Aariz-a-z/python-projects` | 4 |

Remote URLs are recorded exactly as `git remote -v` reports them, with the `.git` suffix
stripped in the table. No project has a `vercel.app`, `netlify.app`, `streamlit.app` or
`github.io` URL committed anywhere in its tracked files: a grep for deployed-host patterns
across all markdown, JSON and TypeScript sources returned zero matches.

### 2.1 RAG Chatbot — `AI Chatbot RAG`

Package name `self-hosted-rag-chatbot`, version `0.1.0`, private.

Declared dependencies (`package.json`, verbatim):

```
dependencies:    @supabase/supabase-js ^2.112.3, next 16.3.1, node-html-parser ^9.0.1,
                 react 19.2.8, react-dom 19.2.8, unpdf ^1.8.1
devDependencies: @tailwindcss/postcss ^4, @types/node ^20, @types/react ^19,
                 @types/react-dom ^19, eslint ^9, eslint-config-next 16.3.1,
                 tailwindcss ^4, typescript ^5
```

Structure:

```
src/app/        admin/, api/{auth/{session,signin,signout,signup},chat,conversations/[id],
                documents/[id],health}, embed/, error.tsx, global-error.tsx, layout.tsx,
                not-found.tsx, page.tsx
src/components/ auth-panel, brand, chat-composer, chat, conversation-sidebar,
                document-panel, embedded-chat, error-banner, message-bubble,
                message-list, message-sources
src/lib/        admin, auth, auth-client, chat-transport, conversation-context,
                conversations, conversations-client, documents, documents-client,
                embeddings/{gemini,ollama,types}, health, inference-mode,
                ingest/{chunking,extract,formats,pipeline,structured,tokens},
                rerank/, supabase/
supabase/migrations/  8 SQL migrations, 20260817 to 20260827
evals/          questions.jsonl, corpus/, reports/ (14 timestamped runs, 2026-08-18 to 08-26)
docs/           DEPLOYMENT.md
public/         widget.js (16 KB), demo/index.html, 5 SVGs
scripts/        ~25 verify:* / ingest / bench / eval scripts
```

**Status evidence — two sources disagree.**

`README.md` line 9 states: *"Status: Level 3 of 25 — connected to a local model… Retrieval
over your documents does not exist yet."*

The git log contradicts it:

```
3eee4c8 Correct the Gemini deployment guide and document email delivery
ab3538a Interrupt sign-up with a dialog telling the user to confirm their email
5d7756f Tell users when sign-in fails because their email is unconfirmed
b62dc34 Default to a Gemini model that does not spend its budget on thinking
0324930 Surface document upload in the chat UI; correct Gemini model defaults
15aafd6 Add Gemini as a production provider for generation and embeddings
3a81a51 AARIZ AI: levels 0-23 complete, Vercel demo mode added
```

The filesystem corroborates the git log rather than the README: `src/lib/embeddings/`,
`src/lib/ingest/`, `src/lib/rerank/`, `evals/reports/` with 14 completed runs, 8 pgvector
migrations including `hybrid_search` and `authentication`, and `/api/documents` all exist.
`ROADMAP.md` Level 24 is titled "Final README" and Level 25 "Final Portfolio Quality Pass",
so the stale README is itself an unfinished level.

Working tree is dirty; work is in progress as of the audit date:

```
 M next.config.ts, package.json, package-lock.json,
   src/components/{chat,chat-composer,message-list}.tsx,
   src/lib/documents{,-client}.ts, src/lib/ingest/extract.ts,
   src/types/database.ts, scripts/verify-documents.ts
?? src/lib/ingest/formats.ts, src/lib/ingest/structured.ts,
   scripts/fixtures/documents.ts,
   supabase/migrations/20260827120000_structured_source_types.sql
```

Last commit `2026-08-26 20:11:19 +0530`; newest migration dated `20260827`. Branch `main`.

`ROADMAP.md` "Technology Stack" names: Next.js, App Router, TypeScript, Tailwind CSS,
Next.js Route Handlers, Supabase PostgreSQL, pgvector, local embeddings via Ollama, an
open-source instruct model via Ollama, and model selection by environment variable.

`.env.local` exists on disk. Its contents were not read or printed.

### 2.2 AI Resume Analyzer — `AI RESUME ANALYZER`

Tracked files: `app.py` (176 lines), `requirements.txt`, `AI_Resume_Fit_Analyzer (1).ipynb`.

`requirements.txt`, verbatim and complete:

```
streamlit
PyMuPDF
sentence-transformers
plotly
```

Verified from `app.py` source:

- `SentenceTransformer('all-MiniLM-L6-v2')`, loaded behind `@st.cache_resource`
- PDF text extraction via `fitz` (PyMuPDF), page-by-page `get_text("text")`
- Regex cleaning: strips non-alphanumerics, collapses whitespace, lowercases
- `util.cos_sim` over resume and job-description embeddings; score clamped to 0–100
- `ats_check()` flags fewer than 50 extracted words as a formatting / ATS warning
- `skill_ontology` dict: 7 skills (DSA, Machine Learning, Artificial Intelligence, NLP,
  Python, SQL, AWS), each with alias lists, matched by word-boundary regex
- Skill-gap computation producing matched and missing lists
- `plotly.graph_objects` radar chart; `st.metric` tiles for match score and missing count
- `resource_links` dict mapping 4 skills to external course URLs

No test suite, no CI, no deployment config, no screenshots.

### 2.3 Sales Forecasting

`Sales_Forecasting_using_Linear_Regression.ipynb` (50 cells) + `sales_forecasting_dataset.csv`.

Markdown cells document, in order: problem statement, goal, objectives, algorithm (linear
regression), then Steps 1–11 — import libraries, load dataset, data cleaning, aggregate
daily to monthly sales, EDA (line plot and month-wise boxplots), feature engineering
(`TimeIndex`, `month_sin`, `month_cos`, lag features), 80/20 train/test split, model
training, evaluation (MAE, RMSE, R²), results visualisation, forecast next 6 months.

Recorded result in the notebook: *"Model explains around 52% of the variance in test data."*

### 2.4 Heart Stroke Prediction

`heart_stroke_logistic_regression.ipynb` (44 cells) + `healthcare-dataset-stroke-data.csv`.

Imports: `pandas`, `numpy`, `matplotlib.pyplot`, `seaborn`,
`sklearn.model_selection.train_test_split`, `sklearn.preprocessing.StandardScaler`,
`sklearn.linear_model.LogisticRegression`,
`sklearn.metrics.{classification_report, confusion_matrix, roc_curve, auc}`.

Documented in markdown cells: class imbalance identified (about 95% no-stroke against 5%
stroke); `bmi` has 201 missing values; `id` dropped; a single `Other` gender row handled;
one-hot encoding of categorical variables; `class_weight='balanced'` used to counter the
imbalance; evaluation by confusion matrix, classification report and ROC-AUC; a coefficient
interpretation section.

Recorded result in the notebook: **ROC-AUC = 0.8390**.

### 2.5 Wine Quality Classification

`SVM_Quality.ipynb` (32 cells) + `WineQT.csv`. Steps documented: import, load, explore
(`head`, `shape`), define X/y with `quality` as target, 80/20 split, `StandardScaler`
feature scaling with an explicit note that SVM is scale-sensitive, SVM training,
prediction, evaluation by accuracy plus per-class precision / recall / F1, confusion-matrix
visualisation. Multiclass target.

### 2.6 Iris Flower Classification

`n_iris_dataset_knn.ipynb` (27 cells) + `iris.csv`. Imports include `KNeighborsClassifier`,
`StandardScaler`, `LabelEncoder`, `train_test_split`, `accuracy_score`, `confusion_matrix`,
`classification_report`.

Documented: three-species classification (Setosa, Versicolor, Virginica), missing-value
check, label encoding of the target, 80/20 split, StandardScaler justified by KNN's
Euclidean distance, KNN training, evaluation, and a k-sweep over k = 1–20 selecting the
best k.

Recorded result in the notebook: **Accuracy = 0.9667**.

### 2.7 Travel Planner — `project 1\frontend travel planner project`

Tracked files (18): `home`, `login`, `logout`, `plan`, `profile`, `signup`, `suggestion`,
`trip`, each as `.html` plus `.css`, and `login.php` (30 lines) and `signup.php` (61 lines).

Observations from source:

- `home.html` has `<meta name="viewport" content="width=device-width, initial-scale=1.0">`
  and a checkbox-hack hamburger menu with a dropdown.
- **Media-query count per stylesheet, measured:** `home.css` 0, `login.css` 0,
  `logout.css` 0, `plan.css` 0, `profile.css` 0, `signup.css` 0, `suggestion.css` 0,
  `trip.css` 0. Total across the project: **zero**.
- `home.html` links `style.css`, which is not present in the repository.
- Title extraction returns content for `home.html` only; the other seven pages return empty.
- Remote font dependency: `fonts.googleapis.com` Roboto, loaded per page.
- `signup.php` and `login.php` connect to MySQL (`mysqli`) against database `user_auth` on
  `localhost`, and are committed to the repository.

A near-duplicate exists at `Desktop\NEW\` (same eight page names, `.js` instead of `.php`)
and a partial copy at `Desktop\myproject\`. Neither is a git repository with a remote;
neither is referenced by the brief.

### 2.8 Python projects set — `python projects`

`git ls-files` output, complete:

```
authentication system/README.md       authentication system/auth.py
authentication system/users.txt       expense tracker/README.md
expense tracker/expense_tracker_.py   expense tracker/expenses.txt
password generator/README.md          password generator/password_generator.py
student management system/README.md   student management system/student.py
student management system/students.txt
```

Four programs, each with a README stating description, features, and "Technologies Used:
Python 3":

- **Authentication System** — signup and login with hashed passwords, file-backed
- **Expense Tracker** — add expenses by category, view all, total spending, file storage
- **Password Generator** — user-defined length, letters plus numbers plus symbols
- **Student Management System** — add and view student records (name, roll number, course),
  persisted to file

A filesystem-wide search for `*guess*` and `*calculat*` under the Desktop source tree
returned **no matches**.

### 2.9 Other repositories present but not named in the brief

- `AARMA` — Python desktop-assistant project (`actions/` with browser, filesystem, keyboard,
  mouse, screenshot, system modules; `ai/` with intent, llm, memory; pytest cache present).
  Has `.env.example` and `.gitignore`. Not in the brief's project list.
- `gen-ai - Copy` — single file, `1-ollama-llm.py`.
- `dbms project`, `backend`, `project ecommerce`, `project car rental app`, `prakruti`,
  `DATA STAGE`, `SQL` — not referenced by the brief; not inspected in depth.

---

## 3. Resume artifacts

Three documents exist, in three formats, with three different contents. All are on disk. No
single file is marked current.

| File | Path | Modified | Format |
|---|---|---|---|
| `Aariz resume.pdf` | `OneDrive\Documents\` | 2025-08-05 | PDF, 1 page |
| `Aariz resume - Copy.pdf` | `OneDrive\Documents\` | 2025-08-05 | same byte size (201,794 B) |
| `Aariz resume.docx` | `OneDrive\Documents\` | 2025-12-11 | DOCX |
| `Aariz cv.pptx` | `OneDrive\Documents\` | 2026-01-20 | PPTX, 1 slide |
| `resume.pdf` | `OneDrive\Documents\hacker\Desktop\` | 2024-11-11 | PDF, 1 page |

### 3.1 PDF text-extraction state

Measured with PyMuPDF:

```
Aariz resume.pdf            page 0: 0 chars of text, 1 image, 595x842pt (A4)
hacker/Desktop/resume.pdf   page 0: 0 chars of text, 0 images, 612x792pt (Letter)
```

`Aariz resume.pdf` contains **no selectable text**. It is a single full-page raster image.
`hacker\Desktop\resume.pdf` extracts neither text nor images.

The PDF's visual content was read by rendering the page at 170 DPI.

### 3.2 Contents by version

**`Aariz resume.pdf` (Aug 2025, image-only).**
Name "PATHAN AARIZ KHAN", title "SOFTWARE DEVLOPER" (sic). Email `aarizmega@gmail.com`,
phone `6301497997`, LinkedIn `linkedin.com/in/aariz-khan-5b46b3292?utm_source=share&…`,
GitHub `github.com/Aariz-a-z`. Education: CMR University 2023–2027, B.Tech AI & ML, no CGPA;
Sri Chaitanya 2021–2023, 70%; Keshava Reddy School 2013–2021, 98%. Projects: Travel Planner
Web App — "Built using Django, HTML, CSS, and MySQL", register/login, destinations, budgets.
Internships: "COINCET — Artificial Intelligence with python", "AI CLUB — Pursuing AI
training and chat bot creation". Skills: Python (programming), frontend HTML/CSS/JS, ML —
ML model creation (Basics). Certificates: **NEURAL NETWORKS (SCALER), SQL (SCALER), REACT JS
(SCALAR)**. Languages: English, Hindi, Urdu, Telugu.

**`Aariz resume.docx` (Dec 2025).**
Same header (`aarizmega@gmail.com`, `linkedin.com/in/aariz-khan-5b46b3292`,
`github.com/Aariz-a-z`). Same education, same Travel Planner / Django description, same two
internships. Certificates: **NEURAL NETWORKS (SCALER), PYTHON, GEN-AI, SQL (SCALER), ML — ML
model creation (Basics)**. Also contains a 65-digit run,
`70104085694517010407737347701040667664310704038968677680952220467`, which parses as five
consecutive 13-digit values; no labels associate them with any certificate.

**`Aariz cv.pptx` (Jan 2026, newest).**
Email `pathanaarizkhan021@gmail.com`, phone `6301497997`, LinkedIn
`linkedin.com/in/aariz-khan-pathan`, GitHub **`github.com/Aariz-devotion`**. Education: CMR
University (Lakeside Campus), Bengaluru — B.Tech AI & ML, 2023–2027, **CGPA 8.6**
[superseded 2026-08-27: user confirms the correct value is 8.8; this line records only what
the PPTX file contains]; Sri
Chaitanya, Kadapa 2021–2023, 70%; Keshava Reddy School, Nandyal, CGPA 9.8. Certificates:
**Machine learning, Machine learning tools, Python, Artificial intelligence basics,
HTML/CSS** — no provider and no date on any of them. Skills: Python, Jupyter Notebook,
Google Colab, VS Code, Git, GitHub, NumPy, Pandas, Matplotlib, Seaborn, Scikit-learn,
regression (linear, logistic), classification (KNN, SVM, decision tree, random forest),
clustering (K-Means), model evaluation (accuracy, precision). Projects: Travel Planner —
"responsive travel planner website… Tech Stack: HTML, CSS"; **Email Spam Classification
System**; **House Price Prediction**; **Customer Segmentation using K-Means**; Python
Projects — "Password Generator, Student Management System, **Number Guessing Game**,
**Calculator Application**". Languages: English, Hindi, Urdu, Telugu. Interests: Cricket,
Kabaddi, Volleyball. No internships section.

### 3.3 Certificate lists across the three versions

| Version | Certificates listed | Provider given | Date given |
|---|---|---|---|
| PDF, Aug 2025 | Neural Networks, SQL, React JS | Scaler (spelled SCALER / SCALAR) | none |
| DOCX, Dec 2025 | Neural Networks, Python, Gen-AI, SQL, ML model creation (Basics) | Scaler on two only | none |
| PPTX, Jan 2026 | Machine learning, Machine learning tools, Python, AI basics, HTML/CSS | none | none |

No two lists agree. No document states an issue date for any certificate. No document
associates a credential ID with a named certificate.

---

## 4. Identity and contact facts — conflicts across sources

| Fact | Brief (§4) | PDF (Aug 25) | DOCX (Dec 25) | PPTX (Jan 26) |
|---|---|---|---|---|
| Email | `pathanaarizkhan021@gmail.com` | `aarizmega@gmail.com` | `aarizmega@gmail.com` | `pathanaarizkhan021@gmail.com` |
| GitHub | `github.com/Aariz-a-z` | `github.com/Aariz-a-z` | `github.com/Aariz-a-z` | `github.com/Aariz-devotion` |
| LinkedIn | `/in/aariz-khan-pathan` | `/in/aariz-khan-5b46b3292` | `/in/aariz-khan-5b46b3292` | `/in/aariz-khan-pathan` |
| CGPA | 8.8 | not stated | not stated | 8.6 — superseded, see note below |
| University location | — | not stated | not stated | Lakeside Campus, Bengaluru |
| Display name | Aariz Khan | Pathan Aariz Khan | Pathan Aariz Khan | Pathan Aariz Khan |
| Phone | `6301497997` | `6301497997` | `6301497997` | `6301497997` |

All eight git remotes resolve to `github.com/Aariz-a-z`, which agrees with the brief and the
two older documents and disagrees with the newest one.

> **Resolution note, added 2026-08-27 after Phase 0.5.** The user has confirmed the
> authoritative values: display name **Aariz Khan**, GitHub **`Aariz-a-z`**, LinkedIn
> **`/in/aariz-khan-pathan`**, email **`pathanaarizkhan021@gmail.com`**, CGPA **8.8**. The
> `8.6` figure above is superseded and was a mistake in the source document. It is retained
> here, and only here, as a record of what the PPTX file physically contains — it is not a
> statement about the actual CGPA, and it appears in no plan, data file, or page copy.

---

## 5. Claims in the brief not currently supported by inspected code

Recorded as observations only, per §1 of the brief.

| Brief statement (§4) | What the code shows |
|---|---|
| Travel Planner — "responsive HTML/CSS front-end" | Zero `@media` queries across all 8 stylesheets. Viewport meta and a hamburger menu are present. |
| Travel Planner — "No implied backend" | `login.php` and `signup.php` are tracked in the repository and open a MySQL connection. |
| Python set — "Password Generator, Student Management System, Number Guessing Game, Calculator" | Repository contains Password Generator, Student Management System, **Authentication System**, **Expense Tracker**. No guessing game or calculator exists on disk. |
| Skills — SQL (basics) | No SQL appears in any of the eight project repositories. Nearest evidence: `SQL` as an entry in the Resume Analyzer's `skill_ontology` dict, and a `SQL (SCALER)` certificate line on two resume versions. |
| Skills — HTML, CSS | Supported: Travel Planner (8 pages) and the RAG project's Tailwind front-end. |
| Skills — FastAPI | No FastAPI import, dependency or file appears in any inspected repository. |
| Skills — Streamlit | Supported: `AI RESUME ANALYZER/requirements.txt` and `app.py`. |
| Skills — Git, GitHub, VS Code, Jupyter, Colab | Git and GitHub supported by 8 remotes; Jupyter supported by 5 `.ipynb` files. VS Code and Colab are not evidenced in tracked files. |
| Skills — probability, statistics | Not evidenced in tracked project code. |
| RAG Chatbot — "in progress" | Agrees with the working tree. The specific milestone is contested between README and git log (§2.1). |
| Education — CGPA 8.8 | **Resolved 2026-08-27.** Not stated in any of the three resume documents at audit time; the figure in the newest one is superseded and was a mistake in that document. The user has confirmed 8.8, which is the value the site uses. |

The newest CV additionally lists three projects — Email Spam Classification, House Price
Prediction, Customer Segmentation (K-Means) — that appear in no repository on disk and in no
list in the brief.

---

## 6. Assets inventory

| Asset class | Found |
|---|---|
| Project UI screenshots | **None.** A recursive image search across the source tree returned only `SQL/bhanuswaroop.png`, `Arshiya inter marks.jpg`, `BMTC APPLICATION.jpg`, `Untitled.png` — none related to any of the eight projects. |
| Photo of the subject | `OneDrive\Documents\Aariz photo.jpg` (557 KB, 2025-08-08) |
| Resume PDF | `OneDrive\Documents\Aariz resume.pdf` (image-only, §3.1) |
| Icons | None. The RAG project has 5 generic Next.js SVGs (`file`, `globe`, `next`, `vercel`, `window`). |
| Fonts | None self-hosted anywhere. Travel Planner loads Roboto from `fonts.googleapis.com` at runtime. |
| OG image | None exists. |
| Favicon | None exists. |

---

## 7. Security and privacy observations

**7.1 — Live database credential committed to a public repository.**

`project 1/frontend travel planner project/signup.php`, line 9, tracked in commit `b6c29cb`
and present in `HEAD`, assigns a hard-coded database password to `$db_password`, alongside
`$db_username = "root"`, `$servername = "localhost"` and `$dbname = "user_auth"`. The file is
committed to `github.com/Aariz-a-z/project-1`, so the credential is in git history and not
only in the working tree.

> **Redacted 2026-08-27 per decision S1.** The literal value was removed from this document
> and is not reproduced in any deliverable. The finding itself is retained. The user is
> handling rotation and history cleanup separately.

**7.2 — Phone number exposure.** `6301497997` appears on all three resume documents. The
brief (§2.6) already raises publishing it on the site as a spam vector.

**7.3 — Email divergence.** Two distinct addresses appear across resume versions (§4). The
account email on this machine, `aarizmega@gmail.com`, matches the older documents.

**7.4 — Resume PDF is a flat image.** Beyond the ATS consequence, it cannot be searched,
selected, or read by a screen reader.

**7.5 — Travel Planner login flow.** `login.php` reads `$_POST['password']` directly.
Password handling in that file was not audited further; it is outside the portfolio scope.

---

## 8. Baseline build state

Not applicable. There is no manifest, no source and no toolchain configuration in the target
directory, so `build`, `typecheck` and `lint` have nothing to run against. There are no
routes to load, no console to check and no links to resolve.

The RAG project has `build`, `lint` and `typecheck` scripts defined, but it is a separate
repository and outside the portfolio's build surface.

---

## 9. Summary of what exists

- **Portfolio code:** none.
- **Verifiable project material:** 8 GitHub repositories, 5 Jupyter notebooks, 1 Streamlit
  app (176 lines), 1 Next.js RAG application (~60 TypeScript source files, 8 SQL migrations,
  14 eval runs), 8 static HTML pages, 4 Python CLI programs.
- **Resume material:** 3 documents that disagree with each other and with the brief on
  email, GitHub handle, LinkedIn URL, CGPA, certificate list and project list.
- **Deployable demo URLs:** none found in any repository.
- **Screenshots:** none.
