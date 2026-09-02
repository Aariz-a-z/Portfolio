import type { SkillGroup } from '@/types/content';

/**
 * Grouped rather than dumped as a badge cloud, and every entry is backed by
 * either a repository or a resume line — the mapping lives in TRUTH-LEDGER.md.
 *
 * Cut for lack of evidence: FastAPI (no import or dependency anywhere),
 * clustering / K-Means (no occurrence in any repository), ML pipelines (no
 * sklearn.pipeline usage), and probability/statistics as standalone claims
 * (folded into model evaluation, which is directly evidenced).
 */
export const skillGroups: SkillGroup[] = [
  {
    id: 'programming',
    label: 'Programming',
    items: [
      { name: 'Python' },
      { name: 'TypeScript' },
      { name: 'SQL', qualifier: 'Basics' },
    ],
  },
  {
    id: 'ai-nlp',
    label: 'AI & NLP',
    items: [
      { name: 'Retrieval-augmented generation' },
      { name: 'Embeddings' },
      { name: 'Semantic search' },
      { name: 'Sentence-Transformers' },
      { name: 'Vector search (pgvector)' },
      { name: 'Generative AI' },
    ],
  },
  {
    id: 'machine-learning',
    label: 'Machine learning',
    items: [
      { name: 'scikit-learn' },
      { name: 'Regression', qualifier: 'linear, logistic' },
      { name: 'Classification', qualifier: 'KNN, SVM' },
      { name: 'Model evaluation' },
      { name: 'Feature engineering' },
    ],
  },
  {
    id: 'data',
    label: 'Data & analysis',
    items: [
      { name: 'pandas' },
      { name: 'NumPy' },
      { name: 'Matplotlib' },
      { name: 'seaborn' },
      { name: 'Exploratory data analysis' },
      { name: 'Data cleaning' },
    ],
  },
  {
    id: 'web',
    label: 'Web & deployment',
    items: [
      { name: 'Next.js' },
      { name: 'React' },
      { name: 'Streamlit' },
      { name: 'HTML' },
      { name: 'CSS' },
      { name: 'Supabase' },
      { name: 'PostgreSQL' },
    ],
  },
  {
    id: 'tools',
    label: 'Tools',
    items: [
      { name: 'Git' },
      { name: 'GitHub' },
      { name: 'Jupyter' },
      { name: 'Google Colab' },
    ],
  },
];
