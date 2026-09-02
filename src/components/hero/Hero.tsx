import { AarizAiPanel } from '@/components/hero/AarizAiPanel';
import { Container } from '@/components/layout/Container';
import { ButtonLink } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { projects } from '@/data/projects';
import { site } from '@/data/site';

/**
 * The hero.
 *
 * WHY THERE IS NO LONGER A RENDERED SEQUENCE
 * ------------------------------------------
 * Five visual directions were built and rejected: a page splitting into bands,
 * the same with thickness, a ream of paper, a lit sheet, a machined instrument,
 * and an etched glass block. The last two failures were the informative ones,
 * because they were not failures of taste.
 *
 * The frames are rendered by three.js under SwiftShader — a CPU rasteriser with
 * no refraction, no caustics and no global illumination. Glass and polished
 * metal are almost entirely those three effects, so they cannot be made to look
 * real with this toolchain; matte paper could, which is why the paper scenes
 * were the ones that nearly worked. The constraint was the renderer, not the
 * metaphor.
 *
 * So the hero shows the product instead of a metaphor for it. AARIZ AI is
 * deployed and working, no other portfolio can show it, and a recruiter
 * understands it faster than any abstraction. It also costs nothing: no canvas,
 * no image sequence, no scroll scrubbing.
 *
 * WHAT THAT BUYS
 * --------------
 * The section is one viewport rather than 2.4, so the projects are one scroll
 * away instead of three. Nothing is deferred, nothing decodes, and the whole
 * hero is server-rendered text — which keeps the heading as the largest
 * contentful paint by construction rather than by measurement.
 *
 * The rendered frames and every scene file have been deleted: nothing
 * referenced them, and 1.3 MB of unreachable WebP was shipping in the deploy.
 * `scripts/render-frames.mjs` is kept — it takes a scene path as an argument,
 * so it remains usable if a rendered hero is ever wanted again.
 */
export function Hero() {
  const secondary = [
    { href: site.links.github, label: 'GitHub', icon: 'github' as const },
    { href: site.links.linkedin, label: 'LinkedIn', icon: 'linkedin' as const },
    { href: `mailto:${site.email}`, label: 'Email', icon: 'mail' as const },
  ];

  // The live demo is a fact about a project, so it is read from the project
  // data rather than written twice. If the URL changes, it changes once.
  const demo = projects.find((p) => p.slug === 'aariz-ai')?.links.demo;

  return (
    <section
      aria-labelledby="hero-heading"
      className="hero-cinema hero-stage relative border-b border-border"
    >
      <Container>
        <div className="grid items-center gap-14 py-16 sm:py-24 lg:min-h-[78svh] lg:grid-cols-12 lg:gap-16 lg:py-20">
          <div className="flex flex-col gap-8 lg:col-span-6">
            <div className="flex flex-col gap-5">
              <p className="t-mono uppercase text-accent">{site.role}</p>

              <h1 id="hero-heading" className="t-display text-text">
                {site.name}
              </h1>

              <p className="t-lead max-w-[20ch] text-text">{site.lead}</p>

              <p className="t-body max-w-[52ch] text-text-secondary">
                {site.discipline}. {site.headline}
              </p>
            </div>

            <div className="flex flex-col gap-5">
              <div className="flex flex-wrap gap-3">
                <ButtonLink href="#work" variant="primary">
                  Explore work
                </ButtonLink>
                <ButtonLink
                  href={site.resume.view}
                  variant="secondary"
                  icon="file-text"
                  iconPosition="start"
                >
                  View resume
                </ButtonLink>
              </div>

              <ul className="flex flex-wrap items-center gap-1">
                {secondary.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      {...(link.href.startsWith('mailto:')
                        ? {}
                        : { target: '_blank', rel: 'noopener noreferrer' })}
                      className="t-small inline-flex min-h-[44px] items-center gap-2 rounded-lg px-3 text-text-secondary transition-colors duration-150 hover:bg-surface-raised hover:text-text"
                    >
                      <Icon name={link.icon} size={18} />
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="lg:col-span-5 lg:col-start-8">
            <AarizAiPanel demo={demo} />
          </div>
        </div>
      </Container>
    </section>
  );
}
