'use client';

import Image from 'next/image';

interface Props {
  name: string;
  avatarUrl?: string;
  size?: number;
}

export default function MemberAvatar({ name, avatarUrl, size = 44 }: Props) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  if (avatarUrl) {
    return (
      <div
        className="relative rounded-full overflow-hidden flex-shrink-0"
        style={{ width: size, height: size }}
      >
        <Image src={avatarUrl} alt={name} fill className="object-cover" unoptimized />
      </div>
    );
  }

  return (
    <div
      className="rounded-full bg-teal-500 text-white flex items-center justify-center font-bold flex-shrink-0 select-none"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.35) }}
    >
      {initials}
    </div>
  );
}
