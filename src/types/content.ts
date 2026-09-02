/**
 * The content contract.
 *
 * Components render from these shapes and hold no project copy of their own.
 * Adding a project is one object appended to `src/data/projects.ts`; no component
 * file changes.
 */

export type ProjectStatus = 'ongoing' | 'completed';
export type ProjectTier = 'flagship' | 'standard' | 'compact';

/**
 * A model evaluation result.
 *
 * Typed rather than written into prose so that precision cannot drift between
 * cards and no metric can acquire business framing on its way to the page. One
 * component renders every instance. Projects without a verified metric omit the
 * field entirely, which is how most of them render no number at all.
 */
export interface Evaluation {
  /** Metric name as it is written on the page, e.g. 'ROC-AUC'. */
  metric: string;
  /** Pre-formatted to three decimals. Not a number, so it cannot be re-rounded. */
  value: string;
  /** Evaluation basis. Present only where it was verified in the source. */
  basis?: string;
}

export interface ProjectMedia {
  /**
   * 'image' — `src` is a file path.
   * 'diagram' — `src` names a drawn diagram in the diagram registry, which
   * exists so a project can carry a vector illustration without a component
   * having to know which project it is rendering.
   */
  kind?: 'image' | 'diagram';
  src: string;
  alt: string;
  /** Explicit intrinsic dimensions. Required to hold CLS below 0.1. */
  width: number;
  height: number;
}

export interface ProjectLinks {
  github?: string;
  /**
   * Omitted when no live demo exists. `ProjectLinks` renders no demo control at
   * all in that case, so there is no code path that can emit a dead button.
   */
  demo?: string;
}

export interface Project {
  slug: string;
  title: string;
  tier: ProjectTier;
  status: ProjectStatus;
  /** One line, used on cards. */
  summary: string;
  problem: string;
  approach: string;
  implementation: string[];
  features: string[];
  /** Only confirmed technologies. An empty array renders nothing. */
  stack: string[];
  links: ProjectLinks;
  media?: ProjectMedia;
  /** Ongoing projects only: what is currently in progress. */
  statusNote?: string;
  evaluation?: Evaluation;
  /**
   * Verified figures, set large in mono on the flagship spread.
   *
   * Every entry must be traceable to the project's own source or to a committed
   * measurement — see TRUTH-LEDGER.md. A figure with no origin does not go here.
   */
  facts?: { value: string; label: string }[];
}

export interface SkillItem {
  name: string;
  /** Honest qualifier where the source states one, e.g. 'Basics'. */
  qualifier?: string;
}

export interface SkillGroup {
  id: string;
  label: string;
  items: SkillItem[];
}

export interface Education {
  institution: string;
  location: string;
  credential: string;
  field: string;
  start: string;
  end: string;
  score: { label: string; value: string };
}

/**
 * Certification shape, deliberately unused.
 *
 * Certifications are omitted from the site by decision. The type and an empty
 * array exist so that supplying verified entries later is a data change rather
 * than a schema change. No component consumes this today.
 */
export interface Certification {
  title: string;
  provider: string;
  date: string;
  credentialId?: string;
  credentialUrl?: string;
}

export interface SiteConfig {
  name: string;
  /** The mono eyebrow above the name. Short enough to sit on one line at 360px. */
  role: string;
  discipline: string;
  /** The hero's positioning statement. Set large; keep it to two clauses. */
  lead: string;
  headline: string;
  email: string;
  links: { github: string; linkedin: string };
  resume: { view: string; download: string };
}
