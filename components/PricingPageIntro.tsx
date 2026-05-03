'use client';

import Link from 'next/link';
import { ROUTES } from '@/lib/routes';

/**
 * Hero for standalone /pricing — matches Contact page gradient and brand colors.
 */
export default function PricingPageIntro() {
  return (
    <section
      className="relative overflow-hidden px-6 py-16 text-center text-white md:py-20"
      style={{ background: 'linear-gradient(115deg, #1C3D72 0%, #1a5085 45%, #2EC4B6 100%)' }}
    >
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-white/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-[#2EC4B6]/30 blur-2xl"
        aria-hidden
      />
      <div className="relative mx-auto max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/80 sm:text-sm">
          Pricing
        </p>
        <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
          Plans that scale with your ministry
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/90 sm:text-lg">
          Start free, upgrade when you&apos;re ready. Every tier includes a{' '}
          <span className="font-semibold text-white">14-day trial</span>, no credit card required to
          explore.
        </p>
        <p className="mt-6 text-sm text-white/75">
          Need a custom bundle or multi-campus quote?{' '}
          <Link
            href={ROUTES.contact}
            className="font-semibold text-white underline decoration-white/40 underline-offset-4 hover:decoration-white"
          >
            Talk to our team
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
