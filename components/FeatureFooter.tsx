import Link from 'next/link';
import { ROUTES } from '@/lib/routes';

export default function FeatureFooter() {
  return (
    <footer
      className="px-6 pt-14 pb-8 text-white"
      style={{
        background: 'linear-gradient(to right, #1C3D72, #2EC4B6)',
      }}
    >
      <div className="max-w-6xl mx-auto space-y-10">
        {/* TOP ROW */}
        <div className="flex flex-col md:flex-row justify-between gap-8">
          {/* LEFT NAV LINKS */}
          <div className="flex gap-4 flex-wrap">
            <FooterLink href={ROUTES.home}>Home</FooterLink>
            <FooterLink href={ROUTES.features}>Features</FooterLink>
            <FooterLink href={ROUTES.developers}>Developers</FooterLink>
            <FooterLink href={ROUTES.contact}>Contact</FooterLink>
            <FooterLink href={ROUTES.pricing}>Pricing</FooterLink>
            <FooterLink href={ROUTES.solutions}>Solutions</FooterLink>
          </div>

          {/* RIGHT SOCIAL LINKS */}
          <div className="flex gap-4 flex-wrap">
            <FooterLink href={ROUTES.social.instagram}>Instagram</FooterLink>
            <FooterLink href={ROUTES.social.linkedin}>LinkedIn</FooterLink>
            <FooterLink href={ROUTES.social.x}>X</FooterLink>
            <FooterLink href={ROUTES.social.facebook}>Facebook</FooterLink>
          </div>
        </div>

        {/* DIVIDER */}
        <div className="h-px bg-white/30" />

        {/* BOTTOM ROW */}
        <div className="flex justify-between text-xs text-white/80">
          <span>Established in 2026</span>
          <Link href={ROUTES.privacy} className="hover:underline">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}

/* --- Reusable footer button --- */
function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="
        px-4
        py-2
        rounded-lg
        border
        border-[#2EC4B6]
        bg-[#2EC4B6]/10
        text-[#d6f7f3]
        text-sm
        hover:bg-[#2EC4B6]/20
        transition
      "
    >
      {children}
    </Link>
  );
}
