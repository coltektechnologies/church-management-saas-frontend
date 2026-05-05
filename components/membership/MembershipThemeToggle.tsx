'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useChurchProfile } from '@/components/admin/dashboard/contexts';
import { getChurchId, updateChurch } from '@/lib/settingsApi';
import { cn } from '@/lib/utils';

function useIsMounted(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

type MembershipThemeToggleProps = {
  /** Visual size — mobile header uses `sm`. */
  size?: 'sm' | 'md';
  className?: string;
};

/**
 * Same behaviour as admin {@link TopNavbar}: toggles church dark mode locally and persists via API.
 */
export default function MembershipThemeToggle({
  size = 'md',
  className = '',
}: MembershipThemeToggleProps) {
  const { profile, toggleDarkMode } = useChurchProfile();
  const mounted = useIsMounted();
  const dark = mounted ? (profile.darkMode ?? false) : false;
  const pc = profile.primaryColor || '#0A2E46';

  const handleClick = useCallback(() => {
    const nextDark = !(profile.darkMode ?? false);
    toggleDarkMode();
    const churchId = getChurchId();
    if (churchId) {
      void updateChurch(churchId, { dark_mode: nextDark }).catch(() => {});
    }
  }, [profile.darkMode, toggleDarkMode]);

  const w = size === 'sm' ? 'w-9' : 'w-10 md:w-11';
  const h = size === 'sm' ? 'h-5' : 'h-5 md:h-6';
  const knob = size === 'sm' ? 'w-3.5 h-3.5 top-0.5' : 'w-4 h-4 md:w-5 md:h-5 top-0.5';
  const knobLeft = dark && mounted ? (size === 'sm' ? 'left-[19px]' : 'left-[22px]') : 'left-0.5';

  const icon =
    mounted &&
    (dark ? (
      <Moon size={size === 'sm' ? 9 : 10} className="text-white" />
    ) : (
      <Sun size={size === 'sm' ? 9 : 10} className="text-yellow-500" />
    ));

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      role="switch"
      aria-checked={dark}
      className={cn(
        'relative rounded-full transition-colors duration-300 shrink-0 flex items-center',
        w,
        h,
        className
      )}
      style={{ backgroundColor: mounted ? (dark ? pc : '#E5E7EB') : '#E5E7EB' }}
    >
      <span
        className={`absolute ${knob} rounded-full bg-white shadow flex items-center justify-center transition-all duration-300 ${knobLeft}`}
      >
        {icon}
      </span>
    </button>
  );
}
