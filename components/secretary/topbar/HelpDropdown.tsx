'use client';

import { useState } from 'react';
import { HelpCircle, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const HELP_ITEMS = [
  { label: 'Getting Started', href: '#' },
  { label: 'FAQs', href: '#' },
  { label: 'Contact Support', href: '#' },
  { label: 'Video Tutorials', href: '#' },
];

export default function HelpDropdown() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center text-muted-foreground hover:bg-accent transition-colors"
        title="Help"
      >
        <HelpCircle size={17} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-52 bg-card border border-border rounded-xl shadow-[0_4px_4px_rgba(0,0,0,0.10)] overflow-hidden z-50">
            <p className="px-4 pt-3 pb-1 text-muted-foreground uppercase text-[10px] font-semibold tracking-widest">
              Help &amp; Support
            </p>

            {HELP_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between px-4 py-2.5 text-foreground hover:bg-accent transition-colors"
              >
                <span className="text-[13px] font-medium">{item.label}</span>
                <ChevronRight size={13} className="text-muted-foreground" />
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
