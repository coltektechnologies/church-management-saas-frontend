'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ROUTES } from '@/lib/routes';
import logo from '@/assets/logo.svg';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { href: ROUTES.features, label: 'Features' },
    { href: ROUTES.developers, label: 'Developers' },
    { href: ROUTES.pricing, label: 'Pricing' },
    { href: ROUTES.contact, label: 'Contact Us' },
    { href: ROUTES.testimonials, label: 'Testimonials' },
  ];

  return (
    <nav
      className="px-6 md:px-8 py-4 md:py-5 text-white relative z-50"
      style={{ background: 'linear-gradient(to right, #1C3D72, #2EC4B6)' }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link
          href={ROUTES.home}
          className="font-semibold text-lg tracking-wide shrink-0 cursor-pointer"
        >
          <Image
            src={logo}
            alt="The Open Door Logo"
            width={240}
            height={50}
            className="h-auto w-auto max-w-[150px] md:max-w-[240px]"
            priority
          />
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex gap-8 text-sm font-medium">
          {navLinks.map(({ href, label }) => (
            <Link
              key={label}
              href={href}
              className="cursor-pointer opacity-90 hover:opacity-100 transition-opacity"
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Desktop Buttons */}
        <div className="hidden md:flex gap-3 items-center">
          <Link href="/login" className="cursor-pointer">
            <button className="cursor-pointer px-4 py-2 text-sm rounded-full border border-white/40 hover:bg-white/10 transition">
              Login
            </button>
          </Link>
          <Link href="/signup" className="cursor-pointer">
            <button className="cursor-pointer px-5 py-2.5 bg-white text-[#1C3D72] rounded-full text-sm font-semibold hover:bg-gray-100 transition">
              Get Started
            </button>
          </Link>
        </div>

        {/* Mobile: Login + Hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <Link href="/login" className="cursor-pointer">
            <button className="cursor-pointer px-3 py-1.5 text-xs rounded-full border border-white/40 hover:bg-white/10 transition">
              Login
            </button>
          </Link>
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
            className="cursor-pointer p-2 rounded-md hover:bg-white/10 transition"
          >
            {menuOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div
          className="md:hidden absolute top-full left-0 w-full text-white px-6 pt-4 pb-6 flex flex-col gap-4 shadow-lg"
          style={{ background: 'linear-gradient(to right, #1C3D72, #2EC4B6)' }}
        >
          {navLinks.map(({ href, label }) => (
            <Link
              key={label}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="cursor-pointer text-sm font-medium opacity-90 hover:opacity-100 transition-opacity border-b border-white/10 pb-3 last:border-0 last:pb-0"
            >
              {label}
            </Link>
          ))}
          <Link href="/signup" onClick={() => setMenuOpen(false)} className="cursor-pointer">
            <button className="cursor-pointer w-full mt-1 px-5 py-2.5 bg-white text-[#1C3D72] rounded-full text-sm font-semibold hover:bg-gray-100 transition">
              Get Started
            </button>
          </Link>
        </div>
      )}
    </nav>
  );
}
