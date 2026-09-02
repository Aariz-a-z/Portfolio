import Link from 'next/link';
import type { AnchorHTMLAttributes, ReactNode } from 'react';

import { Icon, type IconName } from './Icon';

type Variant = 'primary' | 'secondary' | 'quiet';

/**
 * Minimum height of 44px on every variant, so tap targets meet the 44px floor
 * without each call site remembering to ask for it.
 */
const BASE =
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium ' +
  'min-h-[44px] px-4 py-2.5 text-[0.9375rem] ' +
  'transition-[background-color,border-color,color] duration-150 ease-[cubic-bezier(0.2,0,0,1)]';

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-accent text-bg hover:opacity-90 border border-transparent font-semibold',
  secondary:
    'border border-border-strong text-text hover:bg-surface-raised',
  quiet: 'text-text-secondary hover:text-text hover:bg-surface-raised',
};

interface ButtonLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  variant?: Variant;
  icon?: IconName;
  iconPosition?: 'start' | 'end';
  external?: boolean;
  children: ReactNode;
}

export function ButtonLink({
  href,
  variant = 'secondary',
  icon,
  iconPosition = 'end',
  external = false,
  children,
  className = '',
  ...props
}: ButtonLinkProps) {
  const content = (
    <>
      {icon && iconPosition === 'start' && <Icon name={icon} size={18} />}
      <span>{children}</span>
      {icon && iconPosition === 'end' && <Icon name={icon} size={18} />}
    </>
  );

  const classes = `${BASE} ${VARIANTS[variant]} ${className}`.trim();

  if (external) {
    return (
      <a
        href={href}
        className={classes}
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} {...props}>
      {content}
    </Link>
  );
}
