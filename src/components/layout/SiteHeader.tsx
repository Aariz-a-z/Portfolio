import Link from 'next/link';

import { sections, site } from '@/data/site';

import { Container } from './Container';
import { MobileNav } from './MobileNav';
import { ThemeToggle } from './ThemeToggle';

/**
 * Server-rendered navigation, with the resume reachable from every page.
 *
 * Only two things here need JavaScript — the theme toggle and the mobile
 * disclosure — and each is its own client component. The links themselves are
 * static markup, so they cost nothing to hydrate.
 *
 * Below 768px the links collapse into a disclosure rather than shrinking: the
 * panel is a real list of full-width 48px rows, not the same horizontal bar at
 * a smaller size.
 */
export function SiteHeader() {
  const navLinks = sections.map((section) => ({
    href: `/#${section.id}`,
    label: section.label,
  }));

  const mobileLinks = [...navLinks, { href: site.resume.view, label: 'Resume' }];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg">
      <Container>
        <div className="flex h-16 items-center justify-between gap-4">
          <Link
            href="/"
            /* -mx-2 px-2 keeps the 44px target without visibly indenting the
               brand away from the container edge. */
            className="t-small -mx-2 inline-flex min-h-[44px] items-center rounded-lg px-2 font-semibold tracking-tight text-text transition-colors duration-150 hover:bg-surface-raised"
          >
            {site.name}
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="t-small inline-flex min-h-[44px] items-center rounded-lg px-3 text-text-secondary transition-colors duration-150 hover:bg-surface-raised hover:text-text"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={site.resume.view}
              className="t-small ml-1 inline-flex min-h-[44px] items-center rounded-lg border border-border-strong px-3 font-medium text-text transition-colors duration-150 hover:bg-surface-raised"
            >
              Resume
            </Link>
          </nav>

          <div className="flex items-center gap-1">
            <ThemeToggle />
            <MobileNav links={mobileLinks} />
          </div>
        </div>
      </Container>
    </header>
  );
}
