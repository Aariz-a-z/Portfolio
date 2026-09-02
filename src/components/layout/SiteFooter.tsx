import { Icon } from '@/components/ui/Icon';
import { site } from '@/data/site';

import { Container } from './Container';

export function SiteFooter() {
  const year = new Date().getFullYear();

  const links = [
    { href: site.links.github, label: 'GitHub', icon: 'github' as const },
    { href: site.links.linkedin, label: 'LinkedIn', icon: 'linkedin' as const },
    { href: `mailto:${site.email}`, label: 'Email', icon: 'mail' as const },
  ];

  return (
    <footer className="border-t border-border py-10">
      <Container>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="t-small text-text-muted">
            © {year} {site.name}
          </p>
          <ul className="flex flex-wrap items-center gap-1">
            {links.map((link) => (
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
      </Container>
    </footer>
  );
}
