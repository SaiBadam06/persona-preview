'use client';

import { usePathname, useRouter } from 'next/navigation';
import type { CSSProperties, KeyboardEvent, ReactNode } from 'react';

type NavLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  scroll?: boolean;
  onClick?: () => void;
  title?: string;
  'aria-label'?: string;
};

/**
 * Drop-in replacement for next/link that navigates programmatically instead of
 * rendering an <a href>. Because there is no anchor, browsers show no URL in the
 * status bar on hover. Keep ordinary <a> tags for external links where the hover
 * URL is desirable.
 */
export default function NavLink({
  href,
  children,
  className,
  style,
  scroll,
  onClick,
  title,
  ...rest
}: NavLinkProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Resolve query-only hrefs (e.g. "?modal=record") against the current path,
  // matching next/link's relative-resolution behaviour.
  const target = href.startsWith('?') ? `${pathname}${href}` : href;

  const navigate = () => {
    onClick?.();
    router.push(target, scroll === false ? { scroll: false } : undefined);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLSpanElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      navigate();
    }
  };

  return (
    <span
      role="button"
      tabIndex={0}
      title={title}
      className={className}
      style={{ cursor: 'pointer', ...style }}
      onClick={navigate}
      onKeyDown={onKeyDown}
      {...rest}
    >
      {children}
    </span>
  );
}
