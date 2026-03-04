import Link from 'next/link';
import Image from 'next/image';
import logo from '@/assets/logo.svg';

const Footer = () => {
  const footerLinks = [
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Contact', href: '/contact' },
  ];

  const linkClass =
    'font-poppins font-semibold text-[13px] md:text-[14px] text-[#7F8282] hover:opacity-80 transition-opacity leading-none';

  return (
    <footer className="w-full border-t border-[#F1F5F9] bg-white">
      {/* Desktop row */}
      <div className="container mx-auto hidden md:flex h-[80px] items-center justify-between px-6">
        <Link href="/" className="flex items-center hover:opacity-90 transition-opacity">
          <Image
            src={logo}
            alt="The Open Door Logo"
            width={240}
            height={50}
            className="h-auto w-auto max-w-[240px]"
            priority
          />
        </Link>

        <nav className="flex items-center gap-8 lg:gap-14">
          {footerLinks.map((link) => (
            <Link key={link.label} href={link.href} className={linkClass}>
              {link.label}
            </Link>
          ))}
        </nav>

        <p className={linkClass}>©2026 OPEN DOOR. All rights reserved.</p>
      </div>

      {/* Mobile stack */}
      <div className="flex md:hidden flex-col items-center gap-4 py-6 px-4">
        <Link href="/" className="flex items-center hover:opacity-90 transition-opacity">
          <Image
            src={logo}
            alt="The Open Door Logo"
            width={160}
            height={34}
            className="h-auto w-auto max-w-[140px]"
            priority
          />
        </Link>

        <nav className="flex items-center justify-center flex-wrap gap-x-5 gap-y-2">
          {footerLinks.map((link) => (
            <Link key={link.label} href={link.href} className={linkClass}>
              {link.label}
            </Link>
          ))}
        </nav>

        <p className="font-poppins font-semibold text-[11px] text-[#7F8282] text-center">
          ©2026 OPEN DOOR. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
