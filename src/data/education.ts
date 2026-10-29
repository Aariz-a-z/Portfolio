import type { Certification, Education } from '@/types/content';

/**
 * Every entry here matches scripts/resume-data.mjs, which is what the resume
 * PDF is built from. The site previously carried only the degree while the
 * resume carried all three, so a reader comparing the two found the site
 * incomplete.
 */
export const education: Education[] = [
  {
    institution: 'CMR University',
    location: 'Bengaluru',
    credential: 'B.Tech',
    field: 'Artificial Intelligence & Machine Learning',
    start: '2023',
    end: '2027',
    score: { label: 'CGPA', value: '8.8' },
  },
  {
    institution: 'Sri Chaitanya College',
    location: 'Kadapa',
    credential: 'Pre-University',
    field: 'Maths, Physics, Chemistry',
    start: '2021',
    end: '2023',
    score: { label: 'Score', value: '70%' },
  },
  {
    institution: 'Keshava Reddy School',
    location: 'Nandyal',
    credential: 'Secondary School',
    field: 'SSC',
    start: '',
    end: '2021',
    score: { label: 'CGPA', value: '9.8' },
  },
];

/**
 * Deliberately empty.
 *
 * Certifications are omitted from the site by decision, because the available
 * sources disagreed on titles and none carried an issue date or a full provider
 * name. The array exists so that adding verified entries later is a data change
 * rather than a schema change. Nothing renders this today.
 */
export const certifications: Certification[] = [];
