'use client';

import Link from 'next/link';
import { useState } from 'react';

import { Icon } from '@/components/ui/Icon';

import { Container } from './Container';

/**
 * The only interactive part of the navigation, and therefore the only part that
 * needs to be a client component.
 *
 * The header used to be a client component in its entirety, which meant every
 * page shipped and hydrated the whole navigation to support one disclosure
 * button. Isolating it here lets the rest of the header render on the server.
 */
export function MobileNav({ links }: { links: { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label={open ? 'Close menu' : 'Open menu'}
        className="inline-flex size-11 items-center justify-center rounded-lg text-text-secondary transition-colors duration-150 hover:bg-surface-raised hover:text-text md:hidden"
      >
        <Icon name={open ? 'close' : 'menu'} size={22} />
      </button>

      {open && (
        <nav
          id="mobile-nav"
          aria-label="Main"
          className="absolute inset-x-0 top-full border-b border-t border-border bg-bg md:hidden"
        >
          <Container>
            <ul className="flex flex-col py-2">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="t-body flex min-h-[48px] items-center text-text-secondary transition-colors duration-150 hover:text-text"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </nav>
      )}
    </>
  );
}
