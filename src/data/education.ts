import type { Certification, Education } from '@/types/content';

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
