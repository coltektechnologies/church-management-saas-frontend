'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LayoutGrid, LogOut, Shield } from 'lucide-react';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { performLogout } from '@/lib/churchSessionBrowser';
import {
  canAccessAdminShell,
  defaultHomePathForUser,
  probeDepartmentPortalAccess,
  START_HUB_PATH,
  type DepartmentPortalProbe,
  type PostLoginUser,
} from '@/lib/postLoginRedirect';

function readUser(): PostLoginUser | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const raw = localStorage.getItem('user');
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as PostLoginUser;
  } catch {
    return null;
  }
}

function StartPageInner() {
  const router = useRouter();
  const [user] = useState<PostLoginUser | null>(() => readUser());
  const [departmentProbeDone, setDepartmentProbeDone] = useState(false);
  const [portalProbe, setPortalProbe] = useState<DepartmentPortalProbe | null>(null);

  const home = useMemo(() => defaultHomePathForUser(user), [user]);
  const showAdmin = canAccessAdminShell(user);
  const email = (user as { email?: string } | null)?.email;

  useEffect(() => {
    if (user === null) {
      return;
    }
    if (home !== START_HUB_PATH) {
      router.replace(home);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const probe = await probeDepartmentPortalAccess();
        if (!cancelled) {
          setPortalProbe(probe);
        }
        if (probe.ok && !cancelled) {
          router.replace('/departments');
          return;
        }
      } finally {
        if (!cancelled) {
          setDepartmentProbeDone(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, home, router]);

  if (home !== START_HUB_PATH) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600 text-sm">
        Taking you to your workspace…
      </div>
    );
  }

  if (!departmentProbeDone) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600 text-sm">
        Checking department portal access…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-slate-200/80">
        <CardHeader className="text-center space-y-1 pb-2">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <LayoutGrid className="h-6 w-6" aria-hidden />
          </div>
          <CardTitle className="text-xl font-semibold tracking-tight">
            You&apos;re signed in
          </CardTitle>
          <CardDescription className="text-base">
            {email ? <span className="text-slate-700">{email}</span> : 'Your account is active.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-2">
          <p className="text-sm text-muted-foreground text-center leading-relaxed">
            {showAdmin ? (
              <>
                Open the church administration area to manage members, settings, and reports — or
                sign out when you&apos;re done.
              </>
            ) : portalProbe && !portalProbe.ok && portalProbe.kind === 'api_unreachable' ? (
              <>
                The app could not reach the church API from your browser (wrong URL, offline server,
                or CORS). Vercel&apos;s <code className="text-xs">NEXT_PUBLIC_API_URL</code> only
                applies to deployed builds; for <strong>localhost:3000</strong> set{' '}
                <code className="text-xs">.env.local</code> to your API, e.g.{' '}
                <code className="text-xs break-all">
                  NEXT_PUBLIC_API_URL=https://church-management-saas-backend.onrender.com/api
                </code>
                , then restart <code className="text-xs">npm run dev</code>.
              </>
            ) : portalProbe && !portalProbe.ok && portalProbe.kind === 'forbidden' ? (
              <>Your account could not load a church context. Contact support if this persists.</>
            ) : (
              <>
                No dedicated portal is linked to this login yet (for example secretary, treasury,
                department head, or elder in charge). If you should manage a department, ask your
                administrator to link your <strong>member profile</strong> to this login and assign
                you as <strong>primary department head</strong> or <strong>elder in charge</strong>{' '}
                (the API checks that — not only a generic role name).
              </>
            )}
          </p>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            {showAdmin ? (
              <Button className="w-full sm:w-auto gap-2" asChild>
                <Link href="/admin">
                  <Shield className="h-4 w-4" aria-hidden />
                  Church admin
                </Link>
              </Button>
            ) : null}
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto gap-2"
              onClick={() => void performLogout().then(() => router.replace('/login'))}
            >
              <LogOut className="h-4 w-4" aria-hidden />
              Sign out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function StartPage() {
  return (
    <RequireAuth>
      <StartPageInner />
    </RequireAuth>
  );
}
