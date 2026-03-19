'use client';

import Image from 'next/image';
import { useChurchProfile } from '@/components/admin/dashboard/contexts/ChurchProfileContext';
import { User } from 'lucide-react';

interface UserAvatarProps {
  avatarUrl?: string | null;
  name?: string;
  size?: number;
  primaryColor?: string;
}

const UserAvatar = ({
  avatarUrl: propAvatarUrl,
  name: propName,
  size = 32,
  primaryColor: propColor,
}: UserAvatarProps) => {
  const { profile } = useChurchProfile();

  const avatarUrl = propAvatarUrl !== undefined ? propAvatarUrl : profile.avatarUrl;
  const name = propName !== undefined ? propName : profile.adminName;
  const primaryColor = propColor !== undefined ? propColor : profile.primaryColor || '#0B2A4A';

  const initials = (name || '')
    .split(' ')
    .filter(Boolean)
    .map((w: string) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  if (avatarUrl) {
    return (
      <div
        className="relative shrink-0 rounded-full overflow-hidden border border-slate-100 shadow-sm"
        style={{ width: size, height: size }}
      >
        <Image
          src={avatarUrl}
          alt={name || 'User'}
          fill
          className="object-cover"
          unoptimized={avatarUrl.startsWith('data:') || avatarUrl.includes('dicebear')}
        />
      </div>
    );
  }

  if (initials) {
    return (
      <div
        className="shrink-0 rounded-full flex items-center justify-center text-white font-bold select-none shadow-sm"
        style={{ width: size, height: size, backgroundColor: primaryColor, fontSize: size * 0.35 }}
      >
        {initials}
      </div>
    );
  }

  return (
    <div
      className="shrink-0 rounded-full flex items-center justify-center bg-gray-100 dark:bg-white/10"
      style={{ width: size, height: size }}
    >
      <User size={size * 0.5} className="text-gray-400" />
    </div>
  );
};

export default UserAvatar;
