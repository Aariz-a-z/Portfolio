/**
 * Resume content, kept apart from the layout that renders it.
 *
 * Every claim here traces to a repository, a live deployment, or the project's
 * own README. Three rules this file holds itself to, which are the same rules
 * the site's data files hold:
 *
 *   - no skill appears unless it was asked for by name or a repository shows it
 *   - no metric appears unless its source names the file or run it came from
 *   - no project status is stated more strongly than the evidence supports
 *
 * Ordering is deliberate. This version targets an AI Software Engineer
 * requisition (IBM ISDL, job 132895), whose stated expertise list runs
 * AI/ML, NLP, Python, REST API, UI skills, Linux, Kubernetes and open-source
 * databases — so the two systems projects lead, the evaluated models follow,
 * and the web work is compressed to a single line rather than dropped.
 */

export const profile = {
  name: 'Aariz Khan',
  title: 'Artificial Intelligence & Machine Learning Engineer',
  subtitle: 'B.Tech, Artificial Intelligence & Machine Learning — CMR University, Bengaluru',
  email: 'pathanaarizkhan021@gmail.com',
  phone: '+91 6301497997',
  portfolio: 'portfolio-wheat-three-902gdwiuq2.vercel.app',
  portfolioHref: 'https://portfolio-wheat-three-902gdwiuq2.vercel.app/',
  github: 'github.com/Aariz-a-z',
  githubHref: 'https://github.com/Aariz-a-z',
  linkedin: 'linkedin.com/in/aariz-khan-pathan',
  linkedinHref: 'https://linkedin.com/in/aariz-khan-pathan',
};

/**
 * Evidence first, ambition second, and capability rather than enrolment status:
 * it opens on what has been built and shipped, not on what is being studied.
 * The degree and its dates belong in Education, where a reader who wants them
 * will look.
 */
export const summary =
  'Artificial intelligence and machine learning engineer who designs and ships complete ' +
  'AI systems. Three live web applications — retrieval-augmented chat, automated report ' +
  'analysis and semantic resume matching — alongside a voice-controlled desktop agent ' +
  'covered by 1,932 tests. Works across the full path from data preparation and model ' +
  'evaluation to REST APIs and deployment.';

export const projects = [
  {
    title: 'AARIZ AI — Retrieval-Augmented Document Chatbot',
    badge: 'Live',
    stack: 'Next.js · TypeScript · PostgreSQL + pgvector · Supabase · Ollama · Gemini',
    links: [
      { label: 'aariz-ai-three.vercel.app', href: 'https://aariz-ai-three.vercel.app' },
      { label: 'github.com/Aariz-a-z/aariz-ai', href: 'https://github.com/Aariz-a-z/aariz-ai' },
    ],
    bullets: [
      'Answers questions from your own documents and shows which sources it used.',
      'Reads 10 file types including scanned PDFs, splits them into chunks, and stores ' +
        'them as embeddings in PostgreSQL with pgvector.',
      'Searches by meaning and keyword together, then reranks. Found the right passage ' +
        '96.2% of the time across 14 test runs.',
    ],
  },
  {
    /**
     * Deployed and serving: projectrevive-ai.vercel.app returns 200 with the
     * real product behind it. The repository README still opens "feature-
     * complete, not deployed", which is now out of date — worth fixing there,
     * since a recruiter reads the README right after the resume link.
     */
    title: 'ProjectRevive AI — Report Analysis & Recommendations',
    badge: 'Live',
    stack: 'Python · FastAPI · Next.js · TypeScript',
    links: [
      { label: 'projectrevive-ai.vercel.app', href: 'https://projectrevive-ai.vercel.app' },
      {
        label: 'github.com/Aariz-a-z/projectrevive-ai',
        href: 'https://github.com/Aariz-a-z/projectrevive-ai',
      },
    ],
    bullets: [
      'Reads an AI/ML project report and finds what is weak in it, tracing every finding ' +
        'back to the page it came from.',
      'Keeps what the report says separate from what the system inferred, dropping any ' +
        'finding whose quote cannot be verified.',
      'Combines 14 deterministic rules with a model to rank fixes from a catalogue of 22 ' +
        'improvements, behind Argon2id hashing and two layers of rate limiting.',
    ],
  },
  {
    title: 'AI Resume Analyzer',
    badge: 'Live',
    stack: 'Python · Sentence-Transformers · Streamlit · PyMuPDF',
    links: [
      {
        label: 'aariz-ai-resume-analyzer.streamlit.app',
        href: 'https://aariz-ai-resume-analyzer.streamlit.app/',
      },
      {
        label: 'github.com/Aariz-a-z/AI-RESUME-ANALYZER',
        href: 'https://github.com/Aariz-a-z/AI-RESUME-ANALYZER',
      },
    ],
    bullets: [
      'Compares a resume with a job description and scores how well they match, using ' +
        'sentence embeddings rather than keyword matching.',
    ],
  },
  {
    /**
     * Figures come from the README on the pushed repository, not the older
     * working copy on disk: the published project is at Phase 6 with 103 actions
     * and 1,932 passing tests, and that is what a recruiter following the link
     * will see.
     */
    title: 'AARMA — Voice-Controlled Desktop AI Agent',
    stack: 'Python · PySide6 (Qt 6) · SQLite · faster-whisper · edge-tts · pytest',
    links: [
      {
        label: 'github.com/Aariz-a-z/aarma-desktop-agent',
        href: 'https://github.com/Aariz-a-z/aarma-desktop-agent',
      },
    ],
    bullets: [
      'A Windows assistant that takes typed or spoken commands and runs 103 actions.',
      'Every action has its own permission setting and a risk level. Risky ones ask ' +
        'before they run.',
      'Speech recognition runs on the computer, so audio never leaves the machine. ' +
        'Covered by 1,932 tests.',
    ],
  },
];

/**
 * The remaining repositories, compressed. They are real work and worth listing,
 * but on a one-page resume aimed at an engineering role they earn a line, not a
 * block. Travel Planner stays because the requisition asks for full-stack.
 */
export const alsoBuilt = {
  label: 'Other projects',
  /**
   * Names only, no descriptions — these are listed so the breadth is visible and
   * the repositories are reachable, without spending page on work the target
   * role does not turn on. The layout omits the dash when an item has no note.
   */
  items: [
    { name: 'Sales Forecasting', href: 'https://github.com/Aariz-a-z/Sales-forecasting' },
    {
      name: 'Wine Quality Classification',
      href: 'https://github.com/Aariz-a-z/Wine-quality-classification',
    },
    { name: 'Travel Planner', href: 'https://github.com/Aariz-a-z/project-1' },
    { name: 'Python Fundamentals', href: 'https://github.com/Aariz-a-z/python-projects' },
  ],
};

/**
 * Grouped to mirror the requisition's own expertise list, so a parser scanning
 * for its terms finds them under headings that make sense to a human too.
 *
 * PyTorch, Linux, Kubernetes and MongoDB are listed at Aariz's explicit
 * instruction. They are the one group here not evidenced by a repository in
 * this account, so they are the ones to be ready to speak to in interview.
 *
 * Still deliberately absent, because nothing supports them and he did not ask:
 * XGBoost, TensorFlow, C, C++, R, Go, Redis, CouchDB and CockroachDB.
 */
export const skills = [
  {
    label: 'AI & Machine Learning',
    items:
      'PyTorch, scikit-learn, regression (linear, logistic), classification (KNN, SVM), ' +
      'feature engineering, model evaluation (ROC-AUC, confusion matrix, precision / ' +
      'recall / F1, R-squared)',
  },
  {
    label: 'NLP & Retrieval',
    items:
      'Retrieval-augmented generation, embeddings, semantic search, ' +
      'Sentence-Transformers, vector search (pgvector), hybrid retrieval and reranking, ' +
      'speech recognition (Whisper)',
  },
  {
    label: 'Data Science & Platforms',
    items:
      'pandas, NumPy, exploratory data analysis, data cleaning, Matplotlib, seaborn, ' +
      'Plotly, Linux, Kubernetes, REST APIs, PostgreSQL, MongoDB, SQLite, Supabase',
  },
  {
    label: 'Languages & Tools',
    items:
      'Python, TypeScript, SQL, Git, GitHub, Jupyter, Google Colab, VS Code, pytest, ' +
      'FastAPI, Streamlit, PySide6 (Qt), Next.js, React',
  },
];

/**
 * One sentence, covering the whole loop Aariz described: repository and
 * environment setup, task design, reference implementation, test authoring,
 * evaluation runs, quality review and PR delivery.
 *
 * The internal codename (Project Dynamo) is left out on purpose — it means
 * nothing outside Handshake, and the space buys concrete verbs instead. The
 * second engagement he mentioned, Project Octahedron, is not described here
 * because he has not said what it involved.
 */
export const experience = [
  {
    role: 'AI Trainer',
    company: 'Handshake AI',
    location: 'Remote',
    dates: 'Jul 2026 - Sep 2026',
    bullets: [
      'Created and evaluated software-engineering benchmark tasks for AI coding agents — ' +
        'authoring each problem, its reference solution and the tests that verify it, then ' +
        'running evaluations and reviewing every task for difficulty, fairness and ' +
        'correctness, delivered through GitHub pull-request workflows.',
    ],
  },
];

export const education = [
  {
    credential: 'B.Tech, Artificial Intelligence & Machine Learning',
    institution: 'CMR University, Bengaluru',
    dates: '2023 - 2027',
    score: 'CGPA 8.8',
  },
  {
    credential: 'Pre-University (MPC)',
    institution: 'Sri Chaitanya College, Kadapa',
    dates: '2021 - 2023',
    score: '70%',
  },
  {
    credential: 'Secondary School',
    institution: 'Keshava Reddy School, Nandyal',
    dates: '2021',
    score: 'CGPA 9.8',
  },
];

export const languages = 'English, Hindi, Urdu, Telugu';
