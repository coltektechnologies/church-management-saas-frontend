'use client';

import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Globe, Github, Linkedin } from 'lucide-react';
import { DEVELOPERS, type DeveloperProfile } from '@/lib/developers';

const BRAND_NAVY = '#1C3D72';
const BRAND_TEAL = '#2EC4B6';

function SocialXIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function DeveloperCard({ dev }: { dev: DeveloperProfile }) {
  const links: { href: string; label: string; icon: ReactNode }[] = [];
  if (dev.website) {
    links.push({
      href: dev.website,
      label: 'Website',
      icon: <Globe className="h-4 w-4" aria-hidden />,
    });
  }
  if (dev.linkedin) {
    links.push({
      href: dev.linkedin,
      label: 'LinkedIn',
      icon: <Linkedin className="h-4 w-4" aria-hidden />,
    });
  }
  if (dev.github) {
    links.push({
      href: dev.github,
      label: 'GitHub',
      icon: <Github className="h-4 w-4" aria-hidden />,
    });
  }
  if (dev.x) {
    links.push({
      href: dev.x,
      label: 'X',
      icon: <SocialXIcon className="h-4 w-4" />,
    });
  }

  return (
    <article
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition-all duration-300 hover:border-[#2EC4B6]/40 hover:shadow-lg"
      style={{ boxShadow: '0 4px 24px rgba(28, 61, 114, 0.06)' }}
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-slate-100 sm:aspect-[3/4]">
        <Image
          src={dev.imageUrl}
          alt={dev.imageAlt}
          fill
          className="object-cover object-top transition duration-500 group-hover:scale-[1.03]"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1C3D72]/25 to-transparent opacity-0 transition group-hover:opacity-100"
          aria-hidden
        />
      </div>
      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <h3 className="text-xl font-bold tracking-tight sm:text-2xl" style={{ color: BRAND_NAVY }}>
          {dev.name}
        </h3>
        <p
          className="mt-1 text-sm font-semibold uppercase tracking-wider"
          style={{ color: BRAND_TEAL }}
        >
          {dev.role}
        </p>
        <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">{dev.bio}</p>
        {links.length > 0 && (
          <ul className="mt-6 flex flex-wrap gap-2 border-t border-slate-100 pt-6">
            {links.map(({ href, label, icon }) => (
              <li key={label}>
                <Link
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-[#1C3D72] transition hover:border-[#2EC4B6] hover:bg-[#2EC4B6]/10 hover:text-[#1C3D72]"
                >
                  {icon}
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}

export default function DevelopersSection() {
  return (
    <div className="bg-white">
      <header
        className="border-b border-slate-100 px-6 py-16 text-center md:py-20"
        style={{
          background: 'linear-gradient(180deg, rgba(28, 61, 114, 0.04) 0%, #ffffff 100%)',
        }}
      >
        <p
          className="text-xs font-bold uppercase tracking-[0.2em] sm:text-sm"
          style={{ color: BRAND_TEAL }}
        >
          Meet the team
        </p>
        <h1
          className="mx-auto mt-3 max-w-3xl text-3xl font-bold leading-tight sm:text-4xl md:text-5xl"
          style={{ color: BRAND_NAVY }}
        >
          Developers behind the platform
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
          We combine product craft, full-stack engineering, and a deep respect for how churches
          operate. Connect with us below each profile links to the channels we use most.
        </p>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
        <div className="grid gap-10 md:grid-cols-2 lg:gap-12">
          {DEVELOPERS.map((dev) => (
            <DeveloperCard key={dev.id} dev={dev} />
          ))}
        </div>
      </div>
    </div>
  );
}
