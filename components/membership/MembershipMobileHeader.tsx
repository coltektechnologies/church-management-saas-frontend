'use client';

import { useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, Users, KeyRound, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChurchProfile } from '@/components/admin/dashboard/contexts';
import MembershipThemeToggle from '@/components/membership/MembershipThemeToggle';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MEMBERSHIP_MAIN_NAV } from '@/components/membership/membershipNavConfig';
import { useMembershipPortalBrandingCtx } from '@/components/membership/MembershipPortalBrandingContext';
import ChangePasswordModal from '@/components/membership/ChangePasswordModal';
import { performLogout } from '@/lib/churchSessionBrowser';

function useIsMounted(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

/** Visible below `lg` — desktop uses {@link MembershipSidebar}. */
export default function MembershipMobileHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const { mounted, headerLoading, churchTitle, logoUrl, memberLine } =
    useMembershipPortalBrandingCtx();
  const { profile } = useChurchProfile();
  const layoutMounted = useIsMounted();
  const isDark = layoutMounted ? (profile.darkMode ?? false) : false;

  const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

  return (
    <>
      <header
        className={cn(
          'lg:hidden sticky top-0 z-40 flex items-center gap-2 border-b px-3 py-2.5 shadow-sm pt-[max(0.5rem,env(safe-area-inset-top))] transition-colors duration-300',
          isDark ? 'border-white/10 bg-[#0F172A]' : 'border-gray-200 bg-white'
        )}
      >
        <Button
          type="button"
          variant="outline"
          size="icon"
          className={cn(
            'h-10 w-10 shrink-0',
            isDark
              ? 'border-white/15 bg-white/5 hover:bg-white/10'
              : 'border-gray-200 bg-white hover:bg-slate-50'
          )}
          onClick={() => setMenuOpen(true)}
          aria-label="Open navigation menu"
        >
          <Menu className={cn('h-5 w-5', isDark ? 'text-slate-200' : 'text-slate-600')} />
        </Button>
        <div className="min-w-0 flex-1 flex items-center gap-2">
          <div
            className={cn(
              'w-9 h-9 rounded-lg border flex items-center justify-center overflow-hidden shrink-0',
              isDark ? 'bg-white/10 border-white/15' : 'bg-teal-100 border-teal-200/60'
            )}
          >
            {mounted && logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- remote church logo URL
              <img src={logoUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <Users size={18} className={isDark ? 'text-teal-300' : 'text-teal-700'} />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p
              className={cn(
                'text-[12px] font-bold truncate',
                isDark ? 'text-slate-100' : 'text-slate-800'
              )}
            >
              {!mounted || headerLoading ? (
                <span className="inline-block h-3.5 w-[120px] bg-gray-100 animate-pulse rounded" />
              ) : (
                churchTitle
              )}
            </p>
            {!mounted || headerLoading ? (
              <div
                className={cn(
                  'h-2.5 w-20 animate-pulse rounded mt-1',
                  isDark ? 'bg-white/10' : 'bg-gray-100'
                )}
              />
            ) : memberLine ? (
              <p
                className={cn(
                  'text-[10px] truncate mt-0.5',
                  isDark ? 'text-slate-400' : 'text-gray-500'
                )}
                title={memberLine}
              >
                {memberLine}
              </p>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <MembershipThemeToggle size="sm" />
          <span
            className={cn(
              'inline-flex items-center px-2 py-1 border text-[10px] font-semibold rounded-full whitespace-nowrap',
              isDark
                ? 'bg-teal-500/20 text-teal-100 border-teal-400/30'
                : 'bg-teal-50 text-teal-800 border-teal-200/80'
            )}
          >
            Member
          </span>
        </div>
      </header>

      <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
        <DialogContent
          showCloseButton
          overlayClassName="bg-slate-900/35 backdrop-blur-[1px]"
          className={cn(
            'fixed left-0 top-0 z-[2147483641] h-[100dvh] max-h-[100dvh] w-[min(100vw,320px)] max-w-[min(100vw,320px)] translate-x-0 translate-y-0 rounded-none border-y-0 border-l-0 p-0 gap-0 shadow-xl flex flex-col overflow-hidden pt-[env(safe-area-inset-top)]',
            isDark
              ? 'border-r border-white/10 bg-[#0F172A] text-slate-100'
              : 'border-r border-gray-200/90 bg-white text-slate-800'
          )}
        >
          <DialogHeader
            className={cn(
              'p-4 border-b text-left shrink-0',
              isDark ? 'border-white/10 bg-slate-900/80' : 'border-gray-100 bg-slate-50/90'
            )}
          >
            <DialogTitle
              className={cn(
                'text-base font-semibold',
                isDark ? 'text-slate-100' : 'text-slate-800'
              )}
            >
              Member portal
            </DialogTitle>
          </DialogHeader>
          <nav
            className={cn(
              'flex-1 overflow-y-auto min-h-0 p-3 space-y-1',
              isDark ? 'bg-[#0F172A]' : 'bg-white'
            )}
          >
            {MEMBERSHIP_MAIN_NAV.map((item) => {
              const active = isActive(item.path);
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-3 rounded-lg transition-colors border border-transparent',
                    active
                      ? isDark
                        ? 'bg-white/10 text-white border-white/15 shadow-sm'
                        : 'bg-teal-50 text-slate-900 border-teal-200/70 shadow-sm'
                      : isDark
                        ? 'text-slate-200 hover:bg-white/5 active:bg-white/10'
                        : 'text-slate-700 hover:bg-slate-50 active:bg-slate-100'
                  )}
                >
                  <Icon
                    size={18}
                    className={cn(
                      active
                        ? isDark
                          ? 'text-teal-300'
                          : 'text-teal-600'
                        : isDark
                          ? 'text-slate-400'
                          : 'text-slate-500'
                    )}
                  />
                  <span className="font-medium text-[13px]">{item.title}</span>
                </Link>
              );
            })}
          </nav>
          <div
            className={cn(
              'shrink-0 p-3 border-t space-y-1 pb-[max(0.75rem,env(safe-area-inset-bottom))]',
              isDark ? 'border-white/10 bg-slate-900/80' : 'border-gray-100 bg-slate-50/90'
            )}
          >
            <button
              type="button"
              className={cn(
                'w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors',
                isDark ? 'hover:bg-white/5 text-slate-200' : 'hover:bg-white text-slate-700'
              )}
              onClick={() => {
                setMenuOpen(false);
                setPasswordOpen(true);
              }}
            >
              <KeyRound size={18} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
              <span className="font-medium text-[13px]">Change Password</span>
            </button>
            <button
              type="button"
              className={cn(
                'w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors',
                isDark ? 'hover:bg-rose-500/10 text-rose-300' : 'hover:bg-rose-50 text-rose-700'
              )}
              onClick={async () => {
                setMenuOpen(false);
                await performLogout();
                router.push('/login');
              }}
            >
              <LogOut size={18} className={isDark ? 'text-rose-400' : 'text-rose-500'} />
              <span className="font-medium text-[13px]">Logout</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <ChangePasswordModal isOpen={passwordOpen} onClose={() => setPasswordOpen(false)} />
    </>
  );
}
