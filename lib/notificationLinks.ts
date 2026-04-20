/**
 * Older notifications stored `link` as Django admin URLs on the API host (e.g.
 * `http://localhost:8000/admin/departments/program/<id>/change/`). The SPA user
 * has no Django admin session, so those clicks redirected to `/admin/login/` on :8000.
 * Rewrite known patterns to Next.js routes.
 */
export function normalizeNotificationLinkForSpa(raw: string | null | undefined): string {
  if (!raw?.trim()) {
    return '';
  }
  const href = raw.trim();
  try {
    const url = href.startsWith('http')
      ? new URL(href)
      : new URL(
          href,
          typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
        );
    const p = url.pathname.replace(/\/$/, '') || '/';

    const changePath = p.match(/^\/admin\/departments\/program\/([^/]+)\/change$/);
    if (changePath?.[1]) {
      return `/departments/budget?program=${changePath[1]}`;
    }

    if (
      (url.port === '8000' || url.hostname === 'localhost' || url.hostname === '127.0.0.1') &&
      p.includes('/admin/departments/program/')
    ) {
      const parts = p.split('/').filter(Boolean);
      const pi = parts.indexOf('program');
      const id = pi >= 0 ? parts[pi + 1] : '';
      if (id && /^[0-9a-f-]{36}$/i.test(id)) {
        return `/departments/budget?program=${id}`;
      }
    }

    return href;
  } catch {
    return href;
  }
}
