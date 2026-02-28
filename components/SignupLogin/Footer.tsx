import Link from 'next/link';
import Image from 'next/image';
import logo from '@/assets/logo.svg';

/**
 * Footer Component
 * @description Minimalist footer with legal links and teal-colored text.
 * Font: Poppins SemiBold
 */
const Footer = () => {
  const footerLinks = [
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Contact', href: '/contact' },
  ];

  const footerLinkClass =
    'font-poppins font-semibold text-[14px] text-[#7F8282] hover:opacity-80 transition-opacity leading-none';

  return (
    <footer className="w-full border-t border-[#F1F5F9] bg-white">
      <div className="container mx-auto flex h-[80px] items-center justify-between px-4 md:px-6">
        {/* LOGO */}
        <Link href="/" className="flex items-center hover:opacity-90 transition-opacity">
          <Image
            src={logo}
            alt="The Open Door Logo"
            width={240}
            height={50}
            className="h-auto w-auto max-w-[160px] md:max-w-[240px]"
            priority
          />
        </Link>

        {/* NAVIGATION LINKS */}
        <nav className="hidden md:flex items-center justify-center gap-6 lg:gap-14">
          {footerLinks.map((link) => (
            <Link key={link.label} href={link.href} className={footerLinkClass}>
              {link.label}
            </Link>
          ))}
        </nav>

        {/* COPYRIGHT TEXT */}
        <div className={footerLinkClass}>©2026 OPEN DOOR. All rights reserved.</div>
      </div>

      {/* MOBILE NAVIGATION (fallback) */}
      <nav className="flex md:hidden items-center justify-center gap-4 pb-6 px-4 border-t border-[#F1F5F9] pt-4">
        {footerLinks.map((link) => (
          <Link key={link.label} href={link.href} className={footerLinkClass}>
            {link.label}
          </Link>
        ))}
      </nav>
    </footer>
  );
};

export default Footer;
