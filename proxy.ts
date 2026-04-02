import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js 16+: edge guard before App Router. Cookie must match login (see `churchSessionBrowser.ts`).
 *
 * Public (no session cookie): marketing + auth + registration only.
 * Everything else requires `church_session=1` (set on successful login / token storage).
 * With a session cookie, `/` and `/features` redirect to `/admin` so users leave only via Sign out.
 *
 * Optional local preview for /secretary without cookie: set NEXT_PUBLIC_SKIP_SECRETARY_AUTH=true
 * in .env.local and uncomment the skipSecretaryCookie block below, then restart dev.
 * Never enable that in production.
 */
const CHURCH_SESSION_COOKIE = 'church_session';
const CHURCH_SESSION_COOKIE_VALUE = '1';

// // Environment variables for skipping auth in development
// const SKIP_SECRETARY_AUTH = process.env.NEXT_PUBLIC_SKIP_SECRETARY_AUTH === 'true';
// const SKIP_ADMIN_AUTH = process.env.NEXT_PUBLIC_SKIP_ADMIN_AUTH === 'true';
// const SKIP_DEPARTMENT_AUTH = process.env.NEXT_PUBLIC_SKIP_DEPARTMENT_AUTH === 'true';
// const SKIP_DASHBOARD_AUTH = process.env.NEXT_PUBLIC_SKIP_DASHBOARD_AUTH === 'true';

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

/** Where to send users who already have a session cookie but hit login/signup. */
const LOGGED_IN_AUTH_REDIRECT = '/dashboard';

/** Login, signup, and nested auth routes (forgot/reset password). */
function isAuthOnlyPath(pathname: string): boolean {
  if (pathname === '/login' || pathname.startsWith('/login/')) {
    return true;
  }
  if (pathname === '/signup' || pathname.startsWith('/signup/')) {
    return true;
  }
  return false;
}

/** Marketing / landing routes: signed-in users must use Logout first, not browse these. */
function isMarketingShellPath(pathname: string): boolean {
  if (pathname === '/') {
    return true;
  }
  if (pathname === '/features' || pathname.startsWith('/features/')) {
    return true;
  }
  return false;
}

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

// function shouldSkipAuth(pathname: string): boolean {
//   if (pathname.startsWith('/secretary') && SKIP_SECRETARY_AUTH) {
//     return true;
//   }
//   if (pathname.startsWith('/admin') && SKIP_ADMIN_AUTH) {
//     return true;
//   }
//   if (pathname.startsWith('/departments') && SKIP_DEPARTMENT_AUTH) {
//     return true;
//   }
//   if (pathname.startsWith('/dashboard') && SKIP_DASHBOARD_AUTH) {
//     return true;
//   }
//   return false;
// }

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionOk =
    request.cookies.get(CHURCH_SESSION_COOKIE)?.value === CHURCH_SESSION_COOKIE_VALUE;

  // Allow public paths without session
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Allow paths where auth is skipped
  // if (shouldSkipAuth(pathname)) {
  //   return NextResponse.next();
  // }

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
