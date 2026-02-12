'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Header Component
 * @description Sticky top navigation bar with exact branding and desktop/mobile responsiveness.
 * Font: Poppins SemiBold
 */
const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Solutions', href: '#solutions' },
    { label: 'Testimonials', href: '#testimonials' },
  ];

  const headerTextStyle = 'font-poppins font-semibold text-[14px] leading-none tracking-normal';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E2E8F0] bg-white">
      <div className="container mx-auto flex h-[80px] items-center justify-between px-4 md:px-6">
        {/* LOGO SECTION */}
        <Link href="/" className="flex items-center hover:opacity-90 transition-opacity">
          <Image
            src="/logo.webp"
            alt="The Open Door Logo"
            width={240}
            height={50}
            className="h-auto w-auto max-w-[180px] md:max-w-[240px]"
            priority
          />
        </Link>

        {/* DESKTOP NAVIGATION (Hidden on Mobile) */}
        <nav className="hidden lg:flex items-center gap-[50px]">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`${headerTextStyle} text-[#000000] hover:text-[#2FC4B2] transition-colors`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* AUTH BUTTONS SECTION */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/login">
            <Button
              style={{ backgroundColor: '#D9D9D9' }}
              className={`${headerTextStyle} text-black h-[41px] px-8 rounded-full border-none hover:bg-[#CCCCCC] transition-all`}
            >
              Login
            </Button>
          </Link>
          <Link href="/signup">
            <Button
              style={{ backgroundColor: '#666666' }}
              className={`${headerTextStyle} text-white h-[41px] px-8 rounded-full border-none hover:bg-[#444444] transition-all`}
            >
              Get started
            </Button>
          </Link>
        </div>

        {/* MOBILE MENU TOGGLE */}
        <button
          className="lg:hidden p-2 text-black"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle Navigation"
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* MOBILE SIDEBAR OVERLAY */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-[80px] z-40 bg-white lg:hidden animate-in slide-in-from-right duration-300">
          <nav className="flex flex-col items-center gap-8 pt-12">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`${headerTextStyle} text-[18px] text-[#000000]`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col w-full px-12 gap-4 mt-4">
              <Link href="/login" className="w-full">
                <Button className="w-full bg-[#D9D9D9] text-black rounded-full h-[50px]">
                  Login
                </Button>
              </Link>
              <Link href="/signup" className="w-full">
                <Button className="w-full bg-[#666666] text-white rounded-full h-[50px]">
                  Get started
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
