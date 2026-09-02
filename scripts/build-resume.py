"""
Builds the resume PDF.

The previous file was a single full-page raster image with zero extractable
characters, so no applicant tracking system could parse it and no screen reader
could read it. This produces real text.

Content comes only from TRUTH-LEDGER.md. Nothing here is invented. Three
differences from the old file, each on instruction:

  - the phone number stays (it is excluded from the website, not from the PDF)
  - internships and certifications are omitted
  - Travel Planner is described as PHP and MySQL, which is what the repository
    contains; the old file said Django, which appears nowhere in it

Deliberately single-column with no tables, text boxes or multi-column flow,
because those are what break ATS text extraction in the first place.
"""

import fitz

# ---------------------------------------------------------------------------
# Page geometry. A4, generous margins, one column.
# ---------------------------------------------------------------------------
PAGE_W, PAGE_H = fitz.paper_size("a4")
MARGIN_X = 46
MARGIN_TOP = 42
MARGIN_BOTTOM = 26
COL_W = PAGE_W - (2 * MARGIN_X)

INK = (0.07, 0.07, 0.09)
MUTED = (0.36, 0.38, 0.42)
RULE = (0.80, 0.82, 0.85)

FONT_REG = "helv"
FONT_BOLD = "hebo"

NAME = "Aariz Khan"
TAGLINE = "B.Tech - Artificial Intelligence & Machine Learning"
EMAIL = "pathanaarizkhan021@gmail.com"
PHONE = "6301497997"
GITHUB = "github.com/Aariz-a-z"
LINKEDIN = "linkedin.com/in/aariz-khan-pathan"

SUMMARY = (
    "AI and machine learning undergraduate building retrieval and NLP systems: "
    "document ingestion, embeddings and vector search in PostgreSQL, hybrid retrieval "
    "with reranking, and supervised models evaluated on public datasets."
)

EDUCATION = {
    "institution": "CMR University, Bengaluru",
    "credential": "B.Tech, Artificial Intelligence & Machine Learning",
    "dates": "2023 - 2027",
    "score": "CGPA 8.8",
}

PROJECTS = [
    {
        "title": "AARIZ AI - Retrieval-Augmented Document Chatbot",
        "meta": "In progress | Next.js, React, TypeScript, Supabase, PostgreSQL + pgvector, Ollama, Gemini",
        "link": "github.com/Aariz-a-z/aariz-ai",
        "bullets": [
            "Built the full retrieval path: text extraction from PDF and HTML, semantic "
            "chunking at ~600-900 tokens with ~100 token overlap, embedding, and storage "
            "in PostgreSQL with pgvector.",
            "Implemented hybrid retrieval combining vector similarity with full-text "
            "search, fused using Reciprocal Rank Fusion, then reranked; reranking is "
            "fail-open, returning the fused ordering rather than failing the request.",
            "Built a provider abstraction selecting local (Ollama) or hosted (Gemini) "
            "models by environment variable, for both generation and embeddings.",
        ],
    },
    {
        "title": "AI Resume Analyzer",
        "meta": "Python, Streamlit, Sentence-Transformers, PyMuPDF, Plotly",
        "link": "github.com/Aariz-a-z/AI-RESUME-ANALYZER",
        "bullets": [
            "Scores a resume against a job description by encoding both with "
            "all-MiniLM-L6-v2 and comparing them by cosine similarity.",
            "Extracts and normalises PDF text with PyMuPDF, flagging documents an ATS "
            "is likely to mis-parse, and reports missing skills from an alias ontology "
            "as a radar chart.",
        ],
    },
    {
        "title": "Sales Forecasting",
        "meta": "Python, pandas, NumPy, scikit-learn",
        "link": "github.com/Aariz-a-z/Sales-forecasting",
        "bullets": [
            "Aggregated daily transactions into a monthly series with trend, cyclical "
            "month and lag features for linear regression; evaluated on a chronological "
            "hold-out rather than a random split. R-squared: 0.525.",
        ],
    },
    {
        "title": "Heart Stroke Prediction",
        "meta": "Python, pandas, scikit-learn",
        "link": "github.com/Aariz-a-z/Heart-stroke-prediction",
        "bullets": [
            "Logistic regression on an imbalanced public dataset (~5% positive) with "
            "balanced class weights and leak-free scaling; evaluated by confusion matrix, "
            "per-class recall and ROC-AUC of 0.839 on a stratified 80/20 hold-out.",
        ],
    },
    {
        "title": "Wine Quality Classification",
        "meta": "Python, scikit-learn",
        "link": "github.com/Aariz-a-z/Wine-quality-classification",
        "bullets": [
            "Multiclass SVM over standardised physicochemical features, evaluated per "
            "class with a confusion matrix rather than on aggregate accuracy.",
        ],
    },
    {
        "title": "Iris Flower Classification",
        "meta": "Python, scikit-learn",
        "link": "github.com/Aariz-a-z/Iris-flower-classification",
        "bullets": [
            "K-nearest neighbours with feature scaling and a stratified split, plus a "
            "sweep over k from 1 to 20.",
        ],
    },
    {
        "title": "Travel Planner",
        "meta": "HTML, CSS, PHP, MySQL",
        "link": "github.com/Aariz-a-z/project-1",
        "bullets": [
            "Eight-page travel planning interface with PHP sign-up and sign-in "
            "validating against a MySQL database, and a CSS-only navigation menu.",
        ],
    },
    {
        "title": "Python Fundamentals",
        "meta": "Python",
        "link": "github.com/Aariz-a-z/python-projects",
        "bullets": [
            "Password generator, student management system, authentication with "
            "hashed passwords, and an expense tracker; all file-backed.",
        ],
    },
]

SKILLS = [
    ("Programming & Tools", "Python, TypeScript, SQL (Basics), Git, GitHub, Jupyter, Google Colab, VS Code"),
    (
        "AI & NLP",
        "Retrieval-augmented generation, embeddings, semantic search, "
        "Sentence-Transformers, vector search (pgvector)",
    ),
    (
        "Machine Learning & Data",
        "scikit-learn, regression (linear, logistic), classification (KNN, SVM), model "
        "evaluation, feature engineering, pandas, NumPy, Matplotlib, seaborn, EDA",
    ),
    ("Web & Deployment", "Next.js, React, Streamlit, HTML, CSS, Supabase, PostgreSQL"),
]


class Writer:
    """Cursor-based single-column layout with automatic page breaks."""

    def __init__(self, doc):
        self.doc = doc
        self.page = doc.new_page(width=PAGE_W, height=PAGE_H)
        self.y = MARGIN_TOP

    def space(self, amount):
        self.y += amount

    def _ensure(self, needed):
        if self.y + needed > PAGE_H - MARGIN_BOTTOM:
            self.page = self.doc.new_page(width=PAGE_W, height=PAGE_H)
            self.y = MARGIN_TOP

    def text(self, content, size=8.6, font=FONT_REG, color=INK, leading=10.8, indent=0):
        """Insert wrapped text, measuring the box first so nothing is clipped."""
        width = COL_W - indent
        box_height = fitz.get_text_length(content, fontname=font, fontsize=size)
        # Rough line estimate, then let insert_textbox do the real wrapping.
        estimated = max(1, int(box_height / width) + 1)
        needed = estimated * leading + 2
        self._ensure(needed)

        rect = fitz.Rect(
            MARGIN_X + indent, self.y, MARGIN_X + indent + width, self.y + needed + 40
        )
        leftover = self.page.insert_textbox(
            rect, content, fontname=font, fontsize=size, color=color, lineheight=leading / size
        )
        # insert_textbox returns remaining vertical space; convert to consumed height.
        consumed = (rect.height - leftover) if leftover >= 0 else needed
        self.y += consumed
        return consumed

    def heading(self, label):
        self._ensure(30)
        self.space(7)
        self.page.insert_text(
            (MARGIN_X, self.y + 8),
            label.upper(),
            fontname=FONT_BOLD,
            fontsize=9,
            color=INK,
        )
        self.y += 10
        self.page.draw_line(
            fitz.Point(MARGIN_X, self.y),
            fitz.Point(PAGE_W - MARGIN_X, self.y),
            color=RULE,
            width=0.6,
        )
        self.y += 6

    def bullet(self, content):
        self._ensure(16)
        self.page.insert_text(
            (MARGIN_X + 4, self.y + 8), "-", fontname=FONT_REG, fontsize=9.5, color=MUTED
        )
        self.text(content, indent=14, leading=12.5)
        self.y += 0.5


def build(path):
    doc = fitz.open()
    w = Writer(doc)

    # --- Header -----------------------------------------------------------
    w.page.insert_text(
        (MARGIN_X, w.y + 22), NAME, fontname=FONT_BOLD, fontsize=22, color=INK
    )
    w.y += 30
    w.page.insert_text(
        (MARGIN_X, w.y + 10), TAGLINE, fontname=FONT_REG, fontsize=10, color=MUTED
    )
    w.y += 18
    contact = f"{EMAIL}  |  {PHONE}  |  {GITHUB}  |  {LINKEDIN}"
    w.page.insert_text(
        (MARGIN_X, w.y + 10), contact, fontname=FONT_REG, fontsize=8.5, color=MUTED
    )
    w.y += 16
    w.page.draw_line(
        fitz.Point(MARGIN_X, w.y),
        fitz.Point(PAGE_W - MARGIN_X, w.y),
        color=RULE,
        width=0.8,
    )
    w.y += 10

    # --- Summary ----------------------------------------------------------
    w.text(SUMMARY, size=8.6, leading=10.8)

    # --- Education --------------------------------------------------------
    w.heading("Education")
    w.page.insert_text(
        (MARGIN_X, w.y + 9),
        EDUCATION["credential"],
        fontname=FONT_BOLD,
        fontsize=10,
        color=INK,
    )
    w.y += 14
    line = f"{EDUCATION['institution']}  |  {EDUCATION['dates']}  |  {EDUCATION['score']}"
    w.page.insert_text(
        (MARGIN_X, w.y + 9), line, fontname=FONT_REG, fontsize=9, color=MUTED
    )
    w.y += 12

    # --- Projects ---------------------------------------------------------
    w.heading("Projects")
    for index, project in enumerate(PROJECTS):
        w._ensure(38)
        if index:
            w.space(3)
        w.page.insert_text(
            (MARGIN_X, w.y + 9),
            project["title"],
            fontname=FONT_BOLD,
            fontsize=10,
            color=INK,
        )
        w.y += 12
        w.text(
            f'{project["meta"]}  |  {project["link"]}',
            size=8,
            color=MUTED,
            leading=10,
        )
        w.space(1)
        for bullet in project["bullets"]:
            w.bullet(bullet)

    # --- Skills -----------------------------------------------------------
    w.heading("Skills")
    for label, items in SKILLS:
        w._ensure(13)
        w.page.insert_text(
            (MARGIN_X, w.y + 9), f"{label}:", fontname=FONT_BOLD, fontsize=9, color=INK
        )
        offset = fitz.get_text_length(f"{label}:", fontname=FONT_BOLD, fontsize=9) + 6
        rect = fitz.Rect(MARGIN_X + offset, w.y, PAGE_W - MARGIN_X, w.y + 40)
        leftover = w.page.insert_textbox(
            rect, items, fontname=FONT_REG, fontsize=9, color=MUTED, lineheight=1.35
        )
        w.y += max(12.5, rect.height - leftover)

    doc.set_metadata(
        {
            "title": f"{NAME} - Resume",
            "author": NAME,
            "subject": "AI/ML engineering resume",
            "keywords": "machine learning, NLP, retrieval, Python, TypeScript",
        }
    )
    doc.save(path, deflate=True)
    doc.close()
    return path


if __name__ == "__main__":
    import sys

    out = sys.argv[1] if len(sys.argv) > 1 else "public/resume/aariz-khan-resume.pdf"
    build(out)
    print(f"wrote {out}")
