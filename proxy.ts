import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js 16+: edge guard before App Router. Cookie must match login (see `churchSessionBrowser.ts`).
 *
 * Public (no session cookie): marketing + auth + registration only.
 * Everything else requires `church_session=1` (set on successful login / token storage).
 *
 * Optional local preview for /secretary without cookie: set NEXT_PUBLIC_SKIP_SECRETARY_AUTH=true
 * in .env.local and uncomment the skipSecretaryCookie block below, then restart dev.
 * Never enable that in production.
 */
const CHURCH_SESSION_COOKIE = 'church_session';
const CHURCH_SESSION_COOKIE_VALUE = '1';

/** Exact paths that never require a session cookie */
const PUBLIC_EXACT = new Set([
  '/',
  '/favicon.ico',
  '/robots.txt',
  '/manifest.json',
  '/sitemap.xml',
]);

/** Prefixes: path === prefix or path starts with prefix + '/' */
const PUBLIC_PREFIXES = ['/login', '/signup', '/features'];

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_EXACT.has(pathname)) {
    return true;
  }
  for (const prefix of PUBLIC_PREFIXES) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      return true;
    }
  }
  return false;
}

function isNextOrStaticAsset(pathname: string): boolean {
  if (pathname.startsWith('/_next') || pathname.startsWith('/_vercel')) {
    return true;
  }
  if (pathname.startsWith('/.well-known')) {
    return true;
  }
  return /\.(ico|png|jpg|jpeg|svg|gif|webp|txt|xml|json|webmanifest|woff2?|ttf|map)$/i.test(
    pathname
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Uncomment for local secretary preview (with .env NEXT_PUBLIC_SKIP_SECRETARY_AUTH=true):
  const skipSecretaryCookie =
    process.env.NEXT_PUBLIC_SKIP_SECRETARY_AUTH === 'true' &&
    (pathname === '/secretary' || pathname.startsWith('/secretary/'));

  if (isPublicPath(pathname) || isNextOrStaticAsset(pathname) || skipSecretaryCookie) {
    return NextResponse.next();
  }

  const sessionOk =
    request.cookies.get(CHURCH_SESSION_COOKIE)?.value === CHURCH_SESSION_COOKIE_VALUE;

  if (!sessionOk) {
    const login = request.nextUrl.clone();
    login.pathname = '/login';
    login.search = '';
    login.searchParams.set('next', `${pathname}${request.nextUrl.search || ''}`);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * All paths except Next static/image pipelines and obvious static files.
     * RSC requests use normal page pathnames (e.g. /admin) — still gated here.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:ico|png|jpg|jpeg|svg|gif|webp|txt|xml|json|webmanifest|woff2|woff|ttf|map)$).*)',
  ],
};