import Link from 'next/link';

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
    'font-poppins font-semibold text-[14px] text-[#2FC4B2] hover:opacity-80 transition-opacity leading-none';

  return (
    <footer className="w-full border-t border-[#F1F5F9] bg-white py-10">
      <div className="container mx-auto flex flex-col items-center justify-between gap-6 px-4 md:flex-row md:px-6">
        {/* NAVIGATION LINKS */}
        <nav className="flex flex-wrap items-center justify-center gap-6 md:gap-12">
          {footerLinks.map((link) => (
            <Link key={link.label} href={link.href} className={footerLinkClass}>
              {link.label}
            </Link>
          ))}
        </nav>

        {/* COPYRIGHT TEXT */}
        <div className={footerLinkClass}>©2026 OPEN DOOR. All rights reserved.</div>
      </div>
    </footer>
  );
};

export default Footer;
