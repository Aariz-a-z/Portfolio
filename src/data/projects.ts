import type { Project } from '@/types/content';

/**
 * Every project on the site.
 *
 * Components read this file and contain no project copy. Adding a project is one
 * appended object — no component changes.
 *
 * Every claim below traces to a file in the named repository; the mapping is
 * TRUTH-LEDGER.md. Three rules the data enforces on its own:
 *
 *   - `stack: []` renders nothing, so an unconfirmed stack shows no chips.
 *   - `links.demo` omitted means no demo control exists in any code path.
 *   - `evaluation` omitted means no number appears, which is the case for every
 *     project except two.
 */
export const projects: Project[] = [
  {
    slug: 'aariz-ai',
    facts: [
      { value: '10', label: 'source types' },
      { value: '14', label: 'file extensions' },
      { value: '768', label: 'embedding dims' },
      { value: '96.2%', label: 'retrieval hit rate' },
    ],
    title: 'AARIZ AI — Retrieval-Augmented Document Chatbot',
    tier: 'flagship',
    status: 'completed',
    summary:
      'A deployed chatbot that answers questions from your own documents and cites what it used, running against either a local model or a hosted one.',
    problem:
      'A general-purpose chatbot answers from its training data, so it cannot answer questions about documents it has never seen, and it gives you no way to check where an answer came from. Pointing one at your own files normally means paying a cloud API per question and sending those files off your machine.',
    approach:
      'Build the whole retrieval path rather than calling a hosted service: extract text from the uploaded file, split it on semantic boundaries, embed the pieces into Postgres with pgvector, retrieve by hybrid search, rerank what comes back, and give the model only those chunks. Keep the model behind an interface so the same pipeline runs on a local model or a hosted one without touching the pipeline.',
    implementation: [
      'Text extraction converges ten source types across fourteen extensions — PDF, HTML, Markdown, plain text, CSV, JSON, DOCX, DOC, XLSX and XLS — on a single document type before chunking, so there is no separate pipeline per format. PDFs go through unpdf, with an OCR path for scanned pages that carry no text layer. Uploads are parsed from memory rather than written to disk first.',
      'Chunking splits on semantic boundaries in order — headings, then paragraphs, then sentences — at roughly 600 to 900 tokens with about 100 tokens of overlap. Each chunk carries its document title and heading path, so a retrieved fragment can still be read on its own.',
      'Embedding sits behind one interface that owns batching, retry with backoff, input validation and the dimension check. Those policies cannot drift between providers, because each provider adapter only makes a single batch call.',
      'Retrieval embeds the query, searches an HNSW cosine index through a Postgres function, over-fetches candidates so that deduplication cannot return fewer results than were asked for, then deduplicates. The similarity threshold came from measurement rather than taste: a relevant document scored 0.797 against its query where an unrelated one scored 0.433.',
      'Hybrid search combines vector similarity with Postgres full-text search and fuses the two rankings using Reciprocal Rank Fusion. A reranking pass then reorders a larger candidate set before anything reaches the model.',
      'Reranking is fail-open by design. Every failure already has a correct answer available — the fused order — so a broken reranker logs the problem and returns that order instead of failing the request.',
      'The provider layer chooses local (Ollama) or hosted (Gemini) models by environment variable, for both generation and embeddings. One module describes the configuration and a different one enforces it, so a zero-API deployment makes a cloud provider genuinely unselectable rather than just labelling itself local.',
    ],
    features: [
      'Ten document formats, including scanned PDFs',
      'Hybrid retrieval with cited sources',
      'Streaming responses',
      'Conversation history',
      'Authentication and rate limiting',
      'Embeddable chat widget',
      'Evaluation harness with recorded runs',
    ],
    stack: [
      'Next.js',
      'React',
      'TypeScript',
      'Tailwind CSS',
      'Supabase',
      'PostgreSQL + pgvector',
      'unpdf',
      'Ollama',
      'Gemini',
    ],
    links: {
      github: 'https://github.com/Aariz-a-z/aariz-ai',
      demo: 'https://aariz-ai-three.vercel.app',
    },
    media: {
      kind: 'diagram',
      src: 'rag-pipeline',
      alt: 'Architecture of the retrieval pipeline, from document ingestion through to a generated answer with sources.',
      width: 800,
      height: 470,
    },
  },

  {
    slug: 'resume-analyzer',
    title: 'AI Resume Analyzer',
    flow: [
      { term: 'PDF', note: 'Uploaded resume' },
      { term: 'Extract', note: 'PyMuPDF, page by page' },
      { term: 'Chunk', note: '45 words, 12 overlapping' },
      { term: 'Compare', note: 'Per requirement, best chunk' },
      { term: 'Gap', note: 'Named skills, not a score' },
    ],
    tier: 'flagship',
    status: 'completed',
    summary:
      'Scores a resume against a job description using sentence embeddings, and names the required skills the resume never mentions.',
    problem:
      'Keyword matching misses the point. A resume that says "built predictive models" and a posting that asks for "machine learning" describe the same work in different words, and a keyword check scores that as a miss. Separately, an applicant has no way to tell whether an applicant tracking system can read their PDF at all.',
    approach:
      'Compare meaning instead of keywords, but not by embedding each document whole. all-MiniLM-L6-v2 truncates at 256 word pieces and a real two-page resume runs eight hundred to fifteen hundred words, so a document-level embedding never sees most of it — and squeezing two long documents into one vector each collapses every score into a narrow band where a strong candidate and a mediocre one are indistinguishable. So the posting is broken into individual requirements and the resume into overlapping chunks, and each requirement is matched against its best-matching chunk. Every input stays under the token limit, and each requirement gets its own score alongside the resume line that justifies it.',
    implementation: [
      'Text is extracted page by page from the uploaded PDF with PyMuPDF, then normalised by a regex pass that strips punctuation and collapses whitespace before anything is embedded.',
      'The resume is split into overlapping forty-five-word chunks and the posting into at most twenty-four requirements, each requirement scored against its best-matching chunk with all-MiniLM-L6-v2. A cosine of 0.50 or above counts as evidenced and 0.34 to 0.50 as related but thin; the final percentage maps 0.10 to no credit and 0.55 to full credit, because real sentence-to-sentence matches top out near 0.58 and a higher ceiling would make even a perfect candidate look mediocre. The overall figure weights explicit skill coverage at 0.55 against semantic requirement coverage at 0.45, and a stated nice-to-have counts for forty per cent of a must-have. The thresholds are calibrated against a separate evaluation script rather than chosen by eye, and the model is loaded once behind a cache.',
      'A word-count check on the extracted text flags PDFs an applicant tracking system is likely to mis-parse — the failure where a resume looks fine on screen but yields almost no extractable text.',
      'Skill matching resolves aliases so that "ml", "machine learning" and "predictive modeling" collapse to one skill, matched on word boundaries so that partial words cannot produce false hits.',
      'The resulting gap is drawn as a Plotly radar chart of covered against required skills, and each missing skill is paired with a link to a learning resource.',
    ],
    features: [
      'PDF upload and text extraction',
      'Per-requirement match scoring',
      'ATS readability check',
      'Skill-gap analysis',
      'Interactive radar dashboard',
    ],
    stack: ['Python', 'Streamlit', 'Sentence-Transformers', 'PyMuPDF', 'Plotly'],
    links: {
      github: 'https://github.com/Aariz-a-z/AI-RESUME-ANALYZER',
      demo: 'https://aariz-ai-resume-analyzer.streamlit.app',
    },
    gallery: [
      {
        src: '/media/resume-analyzer/compare-before.webp',
        alt: 'Two printed documents lying side by side on a dark desk, a resume on the left and a job posting on the right, both unmarked.',
        caption:
          'Illustration, not a screen capture: the two inputs the analyzer compares.',
        width: 1600,
        height: 1000,
      },
      {
        src: '/media/resume-analyzer/compare-after.webp',
        alt: 'The same two documents, with the requirements present in both now washed in amber on each page while the requirements the resume never mentions are left unmarked.',
        caption:
          'Illustration, not a screen capture: matched requirements lit on both pages; what is left unlit on the posting is the skill gap.',
        width: 1600,
        height: 1000,
      },
    ],
    media: {
      src: '/media/resume-analyzer/dashboard.webp',
      alt: 'The Resume Analyzer dashboard after an example run: an ATS check reporting 517 words extracted, a semantic match score, a count of missing skills, a skill-gap list naming Data Structures and Algorithms and Amazon Web Services, and a radar chart comparing required skills against those found.',
      width: 1600,
      height: 1000,
    },
  },

  {
    slug: 'aarma',
    title: 'AARMA — Voice-Controlled Desktop Agent',
    tier: 'flagship',
    // Phases 1-6 of a phased build. The language-model provider, long-term
    // memory and the installer are not implemented, and the README says so, so
    // this is ongoing rather than completed.
    status: 'ongoing',
    statusNote:
      'Actively built and tested, and not finished: the language-model provider is an interface that currently reports no model configured, and long-term memory and an installer are not built.',
    summary:
      'A Windows desktop agent that takes a spoken or typed instruction, checks it against a permission and risk model, and only then acts — with speech recognition that runs entirely on the machine.',
    problem:
      'A desktop assistant that can open applications, move files and control windows is a security problem before it is a convenience. If it executes whatever a language model proposes, a misheard phrase or a bad suggestion becomes a deleted folder. Most assistants also send recorded audio to a server, so using one means trusting someone else with everything said near the microphone.',
    approach:
      'Put a hard boundary between understanding and acting. Everything above the line — wake word, speech-to-text, intent parsing — only ever produces a structured request; nothing below the line trusts it. The request is then checked against a registry of named actions, a typed parameter schema, a per-capability permission switch and a risk grade before anything runs, and a high-risk action always has to be confirmed. Speech recognition runs locally so audio never leaves the machine.',
    implementation: [
      'A command passes through registry lookup, typed parameter validation, a permission check, a connectivity check and a pre-check before execution. An unregistered action name, an undeclared parameter or a missing permission is refused and audited rather than attempted.',
      'Actions are grouped by capability across twenty modules — filesystem, browser, applications, desktop and window control, keyboard and mouse, media, power, reminders, calendar, email, screenshots, weather and health — each registered with its own parameter schema, permission list and risk grade.',
      'Speech recognition runs on-device through faster-whisper, so audio is never uploaded and never written to disk. A length-aware confidence gate stops short commands being rejected for being short, and the raw recogniser output is shown before validation so a refusal can be explained.',
      'Filesystem actions are confined to the user’s own content folders, resolved through the Windows known-folder API rather than by string matching on paths.',
      'An optional passphrase uses PBKDF2-HMAC-SHA256 from the standard library, and secrets are redacted from logs. State lives in SQLite behind a migration ladder: the conversation transcript, the action audit trail and every permission decision.',
      'The interface is a PySide6 dashboard with dark and light themes generated from one set of design tokens, alongside a full text mode. Interface, input and output languages are configured independently across a ten-language catalogue.',
    ],
    features: [
      'Spoken or typed commands',
      'Two-stage wake word',
      'On-device speech recognition',
      'Per-capability permission switches',
      'Low / medium / high risk grading',
      'Sandboxed filesystem access',
      'Audit trail of every attempt',
    ],
    stack: [
      'Python',
      'PySide6 (Qt 6)',
      'faster-whisper',
      'SQLite',
      'edge-tts',
      'pytest',
    ],
    links: { github: 'https://github.com/Aariz-a-z/aarma-desktop-agent' },
    media: {
      src: '/media/aarma/activity.webp',
      alt: "AARMA's Activity page: a table of every action attempted, each row showing the time, the action name such as open_application or create_reminder, a risk grade of Low or Medium, whether the command arrived by wake word, GUI or text, whether it was allowed, and the outcome.",
      width: 1909,
      height: 997,
    },
    gallery: [
      {
        src: '/media/aarma/conversation.webp',
        alt: "AARMA's Conversation page: a dark desktop window with a sidebar listing Conversation, Activity, Permissions, Settings and About, a header showing the assistant idle, set to English, using the male_calm voice and online, and a command box with suggested commands beneath it.",
        caption: 'The agent at rest, before a command.',
        width: 1576,
        height: 916,
      },
    ],
    flow: [
      { term: 'Listen', note: 'Wake word, then on-device speech' },
      { term: 'Understand', note: 'Intent, not raw text' },
      { term: 'Check', note: 'Registry, schema, permission' },
      { term: 'Grade', note: 'High risk needs confirmation' },
      { term: 'Act', note: 'Sandboxed, and audited' },
    ],
  },

  {
    slug: 'projectrevive',
    title: 'ProjectRevive AI — Report Analysis and Improvement',
    tier: 'flagship',
    // The README still says "feature-complete, not deployed" and lists the live
    // deployment as the one outstanding acceptance criterion. That criterion is
    // now met: the application answers on its own domain, and /login, /signup
    // and /api/health all return 200. Verified 2026-10-29.
    status: 'completed',
    summary:
      'Reads an AI/ML project report and recommends improvements, labelling every finding as either stated in the document with a page citation you can open, or inferred with its reasoning shown.',
    problem:
      'Ask a language model to critique a project report and it will produce confident prose with no way to tell which parts came from the document and which it invented. For a review to be worth acting on, a reader has to be able to check every claim against the source — and a tool that cannot separate what it read from what it guessed cannot offer that.',
    approach:
      'Make provenance a property of the system rather than a promise in the prompt. Every claim carries a label: stated in the report, with a page number and a verbatim quote, or inferred, with the reasoning shown. Citations are then verified against the uploaded document, and a claim quoting text that is not on the page it names is demoted to an inference rather than quietly kept. Findings come from deterministic rules wherever rules can decide, and from the model only where they cannot.',
    implementation: [
      'Fourteen deterministic rules run over the structured profile and the document text. They cannot hallucinate, they need no API key, and they are the reason the whole pipeline works against a mock provider with no spend.',
      'Recommendations come from a hybrid engine over a curated, version-controlled knowledge base of twenty-two improvements: knowledge linkage when a rule detected a problem an entry declares it fixes, and TF-IDF content similarity for ideas no rule covers — capped below anything a finding supports, so a lexical coincidence cannot outrank real evidence. Every score shows its components and weights.',
      'Citations are checked against the uploaded file. A claim citing a page that does not exist, or quoting text absent from the page it names, has its citation rejected and is demoted with a warning rather than softened.',
      'Prompt-injection defence treats document text as untrusted data: it is fenced, never enters the system prompt, and injection-shaped content is flagged rather than obeyed. The Anthropic provider uses structured outputs so a response is schema-validated before anything downstream sees it, and policy declines — which arrive as HTTP 200 rather than an exception — are handled as their own case.',
      'Accounts use Argon2id hashing with a JWT session in an httpOnly cookie. An analysis belonging to another account returns 404 rather than 403, so identifiers cannot be probed. Rate limiting runs in two layers: a per-IP sliding window, and a per-account lockout with exponential backoff that a distributed attack rotating addresses cannot walk through.',
      'Architecture diagrams are generated from a validated component graph rather than from model prose, and the backend refuses to emit a diagram it cannot parse back. The current diagram contains only components the report evidences, so a missing stage means the report never described it.',
    ],
    features: [
      'PDF and DOCX, validated by content',
      'Page-cited evidence you can open',
      'Citations verified against the file',
      'Deterministic rules plus model findings',
      'Transparent recommendation scoring',
      'Before-and-after architecture diagrams',
      'Exportable Markdown report',
    ],
    stack: [
      'Python',
      'FastAPI',
      'Next.js 16',
      'TypeScript',
      'SQLAlchemy',
      'Tailwind CSS',
      'Anthropic API',
    ],
    facts: [
      { value: '336', label: 'tests in CI' },
      { value: '14', label: 'deterministic rules' },
      { value: '22', label: 'curated improvements' },
      { value: '15/15', label: 'MVP criteria met' },
    ],
    flow: [
      { term: 'Upload', note: 'PDF or DOCX, checked by content' },
      { term: 'Extract', note: 'Text with page numbers kept' },
      { term: 'Profile', note: 'Problem, stack, metrics, limits' },
      { term: 'Find', note: 'Rules first, model second' },
      { term: 'Recommend', note: 'Scored, and shown why' },
    ],
    links: {
      github: 'https://github.com/Aariz-a-z/projectrevive-ai',
      demo: 'https://projectrevive-ai.vercel.app',
    },
    media: {
      src: '/media/projectrevive/landing.webp',
      alt: "ProjectRevive AI's landing page, headed “Understand any project report. With receipts.”, beside a sample analysis showing a detected project title, tags for computer vision, CNN on page 3, TensorFlow on page 3 and accuracy on page 4, an evidence-coverage bar reading sixteen stated against one inferred, and a quoted line from page 3.",
      width: 1849,
      height: 895,
    },
    gallery: [
      {
        src: '/media/projectrevive/dashboard.webp',
        alt: 'The signed-in dashboard: a drop area for a PDF or DOCX processed in memory and never written to disk, a list of previous analyses, and a banner stating that no language model is configured so profiles come from keyword matching while the rule-based weakness detection still runs in full.',
        caption:
          'The deployed instance runs without a model key, so it labels itself: analyses are tagged mock and the banner says which parts still work.',
        width: 1846,
        height: 892,
      },
    ],
  },

  {
    slug: 'sales-forecasting',
    title: 'Sales Forecasting',
    tier: 'standard',
    status: 'completed',
    summary:
      'Forecasts monthly sales from historical transactions using a linear model over engineered time features.',
    problem:
      'Transaction records are daily and noisy, while planning happens monthly. A forecast has to work at the planning granularity and account for both a long-run trend and a repeating seasonal shape.',
    approach:
      'Aggregate transactions to a monthly series, then give a linear model the structure it cannot infer on its own: a time index for trend, sine and cosine terms for the cyclical month, and lagged values for recent history. Evaluate on a chronological hold-out rather than a random split, because a random split would let the model see the future.',
    implementation: [
      'Daily transactions are cleaned and aggregated into a regular monthly series anchored to the first day of each month.',
      'Exploratory analysis plots the series over time and month-wise distributions, which is where the trend and the seasonal shape become visible.',
      'Features are a time index for trend, sine and cosine encodings of the month for seasonality, and lags at 1, 2, 3, 6 and 12 months.',
      'The split is chronological — the earliest 80 percent trains, the most recent 20 percent tests — so no future information reaches the model during training.',
      'The fitted model then forecasts six months beyond the end of the data.',
    ],
    features: [
      'Monthly aggregation from daily records',
      'Trend and seasonality features',
      'Lagged history features',
      'Six-month forward forecast',
    ],
    stack: ['Python', 'pandas', 'NumPy', 'scikit-learn', 'Matplotlib', 'seaborn'],
    links: { github: 'https://github.com/Aariz-a-z/Sales-forecasting' },
    evaluation: {
      metric: 'R²',
      value: '0.525',
      basis: 'chronological 80/20 hold-out',
    },
  },

  {
    slug: 'heart-stroke-prediction',
    title: 'Heart Stroke Prediction',
    tier: 'standard',
    status: 'completed',
    summary:
      'A logistic regression exercise on a public health dataset, built around the fact that positive cases are rare.',
    problem:
      'The dataset is heavily imbalanced — roughly one positive case in twenty. A model that predicts "no stroke" every time scores about 95 percent accuracy while being useless, so both the training setup and the choice of metric have to account for that.',
    approach:
      'Treat the imbalance as the central problem rather than a footnote. Weight the classes during training so the rare class is not ignored, and evaluate with metrics that survive imbalance — a confusion matrix, per-class precision and recall, and ROC-AUC — instead of headline accuracy. Then read the fitted coefficients as odds ratios to see which features actually drive the prediction.',
    implementation: [
      'Missing values in the BMI column are handled, the identifier column is dropped as having no predictive value, and a single unrepresented category in the gender column is resolved.',
      'Categorical variables are one-hot encoded with the first level dropped to avoid collinearity.',
      'The scaler is fitted on the training split alone and then applied to the test split, so no test-set statistics leak into training.',
      'Logistic regression is trained with balanced class weights, which makes the rare positive class count proportionally more during fitting.',
      'Evaluation uses a confusion matrix, a per-class classification report and ROC-AUC. Coefficients are exponentiated into odds ratios to make the direction and size of each effect readable.',
    ],
    features: [
      'Imbalance-aware training',
      'Leak-free preprocessing',
      'Threshold-independent evaluation',
      'Odds-ratio interpretation',
    ],
    stack: ['Python', 'pandas', 'NumPy', 'scikit-learn', 'Matplotlib', 'seaborn'],
    links: { github: 'https://github.com/Aariz-a-z/Heart-stroke-prediction' },
    evaluation: {
      metric: 'ROC-AUC',
      value: '0.839',
      basis: 'stratified 80/20 hold-out',
    },
  },

  {
    slug: 'wine-quality',
    title: 'Wine Quality Classification',
    tier: 'standard',
    status: 'completed',
    summary:
      'Multiclass classification of wine quality with a support vector machine over scaled physicochemical features.',
    problem:
      'Quality is graded across several ordered levels rather than two, and the input features are measured on very different numeric ranges — which matters more than usual for a distance-based method.',
    approach:
      'Standardise every feature before fitting, because an SVM decision boundary is sensitive to scale and an unscaled feature with a wide range would dominate the others. Evaluate per class rather than in aggregate, since the quality grades are not evenly represented.',
    implementation: [
      'Features and the quality target are separated, then split 80/20 for training and testing.',
      'All features are standardised to zero mean and unit variance, fitted on the training data.',
      'A support vector machine is trained to separate the quality classes.',
      'Evaluation reports per-class precision, recall and F1 alongside a confusion matrix, so errors between adjacent grades are visible rather than averaged away.',
    ],
    features: [
      'Feature standardisation',
      'Multiclass SVM',
      'Per-class evaluation',
      'Confusion-matrix analysis',
    ],
    stack: ['Python', 'pandas', 'scikit-learn', 'Matplotlib', 'seaborn'],
    links: { github: 'https://github.com/Aariz-a-z/Wine-quality-classification' },
  },

  {
    slug: 'iris-classification',
    title: 'Iris Flower Classification',
    tier: 'standard',
    status: 'completed',
    summary:
      'A fundamentals exercise: k-nearest neighbours on the iris dataset, with scaling and a sweep over k.',
    problem:
      'Classify three iris species from four measurements. The dataset is small and well separated, so the value is in getting the method right rather than in the result.',
    approach:
      'Standardise the features first, because k-nearest neighbours decides by Euclidean distance and unscaled features would weight the larger-ranged measurements more heavily. Then sweep k across a range instead of accepting the default.',
    implementation: [
      'The species label is encoded, and the data is split 80/20 with stratification so each species appears in the same proportion in both halves.',
      'Features are standardised, fitted on the training split.',
      'A k-nearest-neighbours classifier is trained and evaluated with a confusion matrix and a per-class report.',
      'Accuracy is then computed across k from 1 to 20 to show how the choice of k affects the result.',
    ],
    features: ['Stratified split', 'Feature scaling', 'Sweep over k'],
    stack: ['Python', 'pandas', 'scikit-learn', 'Matplotlib', 'seaborn'],
    links: { github: 'https://github.com/Aariz-a-z/Iris-flower-classification' },
  },

  {
    slug: 'travel-planner',
    title: 'Travel Planner',
    tier: 'standard',
    status: 'completed',
    summary:
      'An eight-page travel planning site with PHP sign-up and sign-in against a MySQL database.',
    problem:
      'A trip planner needs more than one screen — browsing destinations, planning a trip, and a personal profile are different tasks — and each of those needs to know who is signed in.',
    approach:
      'Build the interface as separate pages with their own stylesheets, and handle account creation and sign-in server-side in PHP against a MySQL database, rather than keeping account state in the browser.',
    implementation: [
      'Eight pages — home, plan, trip, suggestions, profile, sign-up, sign-in and sign-out — each with its own stylesheet.',
      'Sign-up and sign-in are PHP endpoints that validate the submitted form and query a MySQL database.',
      'Navigation collapses into a dropdown menu driven purely by CSS, with no JavaScript involved.',
    ],
    features: [
      'Multi-page interface',
      'PHP sign-up and sign-in',
      'MySQL-backed accounts',
      'CSS-only navigation menu',
    ],
    stack: ['HTML', 'CSS', 'PHP', 'MySQL'],
    links: { github: 'https://github.com/Aariz-a-z/project-1' },
  },

  {
    slug: 'python-fundamentals',
    title: 'Python fundamentals',
    tier: 'compact',
    status: 'completed',
    summary:
      'Four small command-line programs written while learning Python, each with file-backed persistence.',
    problem: '',
    approach: '',
    implementation: [],
    features: [
      'Password Generator — builds a random password to a chosen length from letters, digits and symbols',
      'Student Management System — adds and lists student records, persisted to a file',
      'Authentication System — sign-up and sign-in with hashed passwords',
      'Expense Tracker — records expenses by category and totals them',
    ],
    stack: ['Python'],
    links: { github: 'https://github.com/Aariz-a-z/python-projects' },
  },
];
