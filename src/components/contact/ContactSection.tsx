import { ButtonLink } from '@/components/ui/Button';
import { site } from '@/data/site';

/**
 * The exit points, in the order a recruiter is most likely to want them.
 *
 * No phone number and no contact form: a form needs a backend and gives the
 * reader no confirmation that anything was sent, while a mailto opens the tool
 * they already use.
 */
export function ContactSection() {
  return (
    <div className="flex flex-col gap-8">
      {/* The closing line of the page, so it is set at lead size rather than as
          body copy under a heading. */}
      <p className="t-lead max-w-[26ch] text-text">
        The quickest way to reach me is email. I read everything, and I reply.
      </p>

      <div className="flex flex-wrap gap-3">
        <ButtonLink
          href={`mailto:${site.email}`}
          variant="primary"
          icon="mail"
          iconPosition="start"
        >
          {site.email}
        </ButtonLink>
        <ButtonLink
          href={site.links.linkedin}
          external
          icon="linkedin"
          iconPosition="start"
        >
          LinkedIn
        </ButtonLink>
        <ButtonLink
          href={site.links.github}
          external
          icon="github"
          iconPosition="start"
        >
          GitHub
        </ButtonLink>
        <ButtonLink
          href={site.resume.view}
          icon="file-text"
          iconPosition="start"
        >
          Resume
        </ButtonLink>
      </div>
    </div>
  );
}
