import type { Metadata } from 'next';

import { Container } from '@/components/layout/Container';
import { DeferredPdf } from '@/components/layout/DeferredPdf';
import { EducationSection } from '@/components/education/EducationSection';
import { ButtonLink } from '@/components/ui/Button';
import { absoluteUrl, site } from '@/data/site';

const canonical = absoluteUrl('/resume');

export const metadata: Metadata = {
  title: 'Resume',
  description: `Resume for ${site.name} — AI and machine learning student building retrieval and NLP systems.`,
  ...(canonical ? { alternates: { canonical } } : {}),
};

/**
 * Download first, viewer second.
 *
 * The embed is the heaviest thing on the site, so the actions render above it
 * and the viewer sits below the fold: a recruiter who only wants the file gets
 * it without waiting for a PDF renderer to start, and the page's largest
 * contentful paint stays text.
 *
 * `<object>` rather than a PDF library — the browser already renders PDFs, and
 * the nested link is a real fallback for the browsers that do not.
 */
export default function ResumePage() {
  return (
    <Container>
      <div className="flex flex-col gap-8 py-14 sm:py-20">
        <div className="flex flex-col gap-4">
          <h1 className="t-h1 text-text">Resume</h1>
          <p className="t-body measure text-text-secondary">
            The same information as this site, on one page. The PDF is
            text-based, so an applicant tracking system can read it.
          </p>
          <div className="flex flex-wrap gap-3">
            <ButtonLink
              href={site.resume.download}
              variant="primary"
              icon="download"
              iconPosition="start"
              download
            >
              Download PDF
            </ButtonLink>
            <ButtonLink href="/" variant="secondary">
              Back to portfolio
            </ButtonLink>
          </div>
        </div>

        <section aria-labelledby="resume-education">
          <h2 id="resume-education" className="t-h3 mb-4 text-text">
            Education
          </h2>
          <EducationSection />
        </section>

        <section aria-labelledby="resume-preview" className="flex flex-col gap-3">
          <h2 id="resume-preview" className="t-h3 text-text">
            Preview
          </h2>
          <DeferredPdf
            src={site.resume.download}
            title={`Resume of ${site.name}, PDF preview`}
            fallback={
              <div className="flex h-full flex-col items-start justify-center gap-3 p-6">
                <p className="t-body text-text-secondary">
                  Your browser cannot display the PDF inline.
                </p>
                <ButtonLink
                  href={site.resume.download}
                  variant="secondary"
                  icon="download"
                  iconPosition="start"
                  download
                >
                  Download the PDF instead
                </ButtonLink>
              </div>
            }
          />
          <noscript>
            <object
              data={site.resume.download}
              type="application/pdf"
              className="h-[70vh] min-h-[420px] w-full rounded-xl border border-border bg-surface"
              aria-label={`Resume of ${site.name}, PDF preview`}
            />
          </noscript>
        </section>
      </div>
    </Container>
  );
}
