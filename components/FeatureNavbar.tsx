'use client';

import Link from 'next/link';
import { ROUTES } from '@/lib/routes';

export default function Navbar() {
  return (
    <nav
      className="px-8 py-5 text-white"
      style={{
        background: 'linear-gradient(to right, #1C3D72, #2EC4B6)',
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href={ROUTES.home} className="font-semibold text-lg tracking-wide">
          The Open Door
        </Link>

        <div className="hidden md:flex gap-8 text-sm font-medium">
          <Link href={ROUTES.features} className="opacity-90 hover:opacity-100">
            Features
          </Link>
          <Link href={ROUTES.pricing} className="opacity-90 hover:opacity-100">
            Pricing
          </Link>
          <Link href={ROUTES.contact} className="opacity-90 hover:opacity-100">
            Contact Us
          </Link>
          <Link href={ROUTES.testimonials} className="opacity-90 hover:opacity-100">
            Testimonials
          </Link>
        </div>

        <div className="flex gap-3 items-center">
          <Link href="/login">
            <button className="px-4 py-2 text-sm rounded-full border border-white/40 hover:bg-white/10 transition">
              Login
            </button>
          </Link>

          <Link href="/get-started">
            <button className="px-5 py-2.5 bg-white text-[#1C3D72] rounded-full text-sm font-semibold hover:bg-gray-100 transition">
              Get Started
            </button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
