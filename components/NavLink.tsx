/**
 * NavLink Component
 * * Link to provide 'active' and 'pending' styling states.
 * * Uses 'usePathname' to determine the active route.
 */

'use client';

import Link, { LinkProps } from 'next/link';
import { usePathname } from 'next/navigation';
import { forwardRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';

// Define the interface for props to include custom styling classes
interface NavLinkCompatProps extends LinkProps {
  children: ReactNode;
  className?: string;
  activeClassName?: string;
  pendingClassName?: string;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  ({ className, activeClassName, pendingClassName, href, ...props }, ref) => {
    const pathname = usePathname();

    // Determine if the link is active based on current URL path
    const isActive = pathname === href || (href !== '/' && pathname?.startsWith(href.toString()));

    return (
      <Link
        ref={ref}
        href={href}
        className={cn(
          'nav-link-base transition-colors duration-200',
          className,
          isActive && activeClassName,
          // Placeholder for pending state logic if needed in the future
          false && pendingClassName
        )}
        {...props}
      >
        {props.children}
      </Link>
    );
  }
);

NavLink.displayName = 'NavLink';

export { NavLink };
