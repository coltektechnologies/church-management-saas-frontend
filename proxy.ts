import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { getSafeInternalPath } from '@/lib/safeReturnPath';

/**
 * Next.js 16+: edge guard before App Router. Cookie must match login (see `churchSessionBrowser.ts`).
 *
 * Public (no session cookie): marketing + auth + registration only.
 * Everything else requires `church_session=1` (set on successful login / token storage).
 * With a session cookie, `/` and `/features` redirect to `/admin` so users leave only via Sign out.
 *
 * Optional local preview for /secretary without cookie: set NEXT_PUBLIC_SKIP_SECRETARY_AUTH=true
 * in .env.local, then restart dev.
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
const PUBLIC_PREFIXES = [
  '/login',
  '/signup',
  '/features',
  '/developers',
  '/contact',
  '/pricing',
  '/secretary',
  '/treasury',
  '/admin',"/department"
];

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

  const sessionOk =
    request.cookies.get(CHURCH_SESSION_COOKIE)?.value === CHURCH_SESSION_COOKIE_VALUE;

  // Logged-in users cannot open login/signup (back button or direct URL) without logging out.
  if (sessionOk && isAuthOnlyPath(pathname)) {
    const nextParam = request.nextUrl.searchParams.get('next');
    const safeNext = getSafeInternalPath(nextParam);
    const dest = request.nextUrl.clone();
    dest.search = '';
    // Prefer ?next= when safe; otherwise /dashboard (client picks /secretary vs /admin from localStorage).
    dest.pathname = safeNext ?? LOGGED_IN_AUTH_REDIRECT;
    return NextResponse.redirect(dest);
  }

  // Signed-in users cannot "exit" to the marketing site without logging out (clears cookie).
  if (sessionOk && isMarketingShellPath(pathname)) {
    const dest = request.nextUrl.clone();
    dest.pathname = '/admin';
    dest.search = '';
    return NextResponse.redirect(dest);
  }

  // auth bypasses for local preview without cookie: set NEXT_PUBLIC_SKIP_*_AUTH=true in .env.local and restart dev
  const skipDepartmentsAuth =
    process.env.NEXT_PUBLIC_SKIP_DEPARTMENT_AUTH === 'true' &&
    (pathname === '/departments' || pathname.startsWith('/departments/'));

  const skipSecretaryAuth =
    process.env.NEXT_PUBLIC_SKIP_SECRETARY_AUTH === 'true' &&
    (pathname === '/secretary' || pathname.startsWith('/secretary/'));

  const skipAdminAuth =
    process.env.NEXT_PUBLIC_SKIP_ADMIN_AUTH === 'true' &&
    (pathname === '/admin' || pathname.startsWith('/admin/'));

  const skipDashboardAuth =
    process.env.NEXT_PUBLIC_SKIP_DASHBOARD_AUTH === 'true' &&
    (pathname === '/dashboard' || pathname.startsWith('/dashboard/'));

  const skipTreasuryAuth =
    process.env.NEXT_PUBLIC_SKIP_TREASURY_AUTH === 'true' &&
    (pathname === '/treasury' || pathname.startsWith('/treasury/'));

  const skipAuth =
    skipDepartmentsAuth ||
    skipSecretaryAuth ||
    skipAdminAuth ||
    skipDashboardAuth ||
    skipTreasuryAuth;

  // ✅ Single unified check — no duplicate block after this
  if (isPublicPath(pathname) || isNextOrStaticAsset(pathname) || skipAuth) {
    return NextResponse.next();
  }

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
