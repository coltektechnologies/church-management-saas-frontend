'use client';

import { useState, useEffect, ReactNode } from 'react';

/**
 * Renders children only after mount. Use to avoid hydration mismatch when
 * children use random IDs (e.g. Radix UI aria-controls) that differ between
 * server and client.
 */
export function ClientOnly({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);
  if (!mounted) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
}
