/**
 * NavLink Component
 * * Purpose: A custom link component that handles active navigation states.
 * Font: Outfit
 */

'use client';

import Link, { LinkProps } from 'next/link';
import { usePathname } from 'next/navigation';
import { forwardRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface NavLinkProps extends LinkProps {
  children: ReactNode;
  className?: string;
  activeClassName?: string;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  ({ className, activeClassName, href, ...props }, ref) => {
    const pathname = usePathname();

    // Check if current path matches the link destination
    const isActive = pathname === href || (href !== '/' && pathname?.startsWith(href.toString()));

    return (
      <Link
        ref={ref}
        href={href}
        className={cn(
          'nav-link-item transition-all duration-200 px-4 py-2 font-medium',
          className,
          isActive && activeClassName,
          isActive ? 'opacity-100 text-[#17D7BE]' : 'opacity-80 hover:opacity-100 text-white'
        )}
        style={{ fontFamily: 'Outfit, sans-serif' }}
        {...props}
      >
        {props.children}
      </Link>
    );
  }
);

NavLink.displayName = 'NavLink';

export { NavLink };
