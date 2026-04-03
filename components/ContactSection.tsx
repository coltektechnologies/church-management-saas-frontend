'use client';

import { useState, type FormEvent, type ReactNode } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  MessageSquare,
  Linkedin,
  Instagram,
  Facebook,
} from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { CONTACT_INFO } from '@/lib/contact';

const NAVY = '#1C3D72';
const TEAL = '#2EC4B6';

function SocialXIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function SocialPill({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#1C3D72] shadow-sm transition hover:border-[#2EC4B6] hover:bg-[#2EC4B6]/10"
    >
      {children}
      {label}
    </Link>
  );
}

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-[#2EC4B6] focus:ring-2 focus:ring-[#2EC4B6]/25';

export default function ContactSection() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error('Please fill in your name, email, and message.');
      return;
    }
    setSending(true);
    const body = `Name: ${name}\nEmail: ${email}\nOrganization: ${organization || '—'}\n\n${message}`;
    const mailto = `mailto:${CONTACT_INFO.email}?subject=${encodeURIComponent(subject || 'Open Door — contact form')}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
    toast.success('Opening your email app…', {
      description: 'If nothing opens, copy your message and email us directly.',
    });
    setSending(false);
  };

  return (
    <div className="bg-white">
      {/* Hero */}
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
            Contact
          </p>
          <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
            Let&apos;s build something meaningful together
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/90 sm:text-lg">
            Demos, pricing, technical questions, or partnerships—send us a note.{' '}
            {CONTACT_INFO.tagline}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 py-14 md:py-20">
        <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-14">
          {/* Left: info */}
          <div className="space-y-8 lg:col-span-5">
            <div>
              <h2 className="text-2xl font-bold tracking-tight" style={{ color: NAVY }}>
                Get in touch
              </h2>
              <p className="mt-3 text-base leading-relaxed text-slate-600">
                Prefer email or social? Reach us directly—we read every message and route it to the
                right person on the team.
              </p>
            </div>

            <ul className="space-y-4">
              <li>
                <a
                  href={`mailto:${CONTACT_INFO.email}`}
                  className="group flex gap-4 rounded-2xl border border-slate-200/90 bg-slate-50/80 p-5 transition hover:border-[#2EC4B6]/50 hover:bg-white hover:shadow-md"
                >
                  <span
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white shadow-sm"
                    style={{ background: `linear-gradient(135deg, ${NAVY}, ${TEAL})` }}
                  >
                    <Mail className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Email
                    </p>
                    <p className="mt-1 font-semibold text-[#1C3D72] group-hover:underline">
                      {CONTACT_INFO.email}
                    </p>
                  </div>
                </a>
              </li>
              <li>
                <div className="flex gap-4 rounded-2xl border border-slate-200/90 bg-slate-50/80 p-5">
                  <span
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white shadow-sm"
                    style={{ background: `linear-gradient(135deg, ${NAVY}, ${TEAL})` }}
                  >
                    <Phone className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Phone
                    </p>
                    <p className="mt-1 font-semibold text-slate-800">{CONTACT_INFO.phone}</p>
                  </div>
                </div>
              </li>
              <li>
                <div className="flex gap-4 rounded-2xl border border-slate-200/90 bg-slate-50/80 p-5">
                  <span
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white shadow-sm"
                    style={{ background: `linear-gradient(135deg, ${NAVY}, ${TEAL})` }}
                  >
                    <MapPin className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Location
                    </p>
                    <p className="mt-1 font-semibold text-slate-800">{CONTACT_INFO.addressLine}</p>
                  </div>
                </div>
              </li>
            </ul>

            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Follow us</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <SocialPill href={ROUTES.social.linkedin} label="LinkedIn">
                  <Linkedin className="h-4 w-4" aria-hidden />
                </SocialPill>
                <SocialPill href={ROUTES.social.instagram} label="Instagram">
                  <Instagram className="h-4 w-4" aria-hidden />
                </SocialPill>
                <SocialPill href={ROUTES.social.x} label="X">
                  <SocialXIcon className="h-4 w-4" />
                </SocialPill>
                <SocialPill href={ROUTES.social.facebook} label="Facebook">
                  <Facebook className="h-4 w-4" aria-hidden />
                </SocialPill>
              </div>
            </div>
          </div>

          {/* Right: form */}
          <div className="lg:col-span-7">
            <div
              className="rounded-3xl border border-slate-200/90 bg-white p-8 shadow-xl sm:p-10"
              style={{ boxShadow: '0 25px 50px -12px rgba(28, 61, 114, 0.12)' }}
            >
              <div className="mb-8 flex items-start gap-3">
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white"
                  style={{ background: `linear-gradient(135deg, ${NAVY}, ${TEAL})` }}
                >
                  <MessageSquare className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <h2 className="text-xl font-bold text-[#1C3D72] sm:text-2xl">Send a message</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    We&apos;ll open your email client with your message pre-filled—you can edit
                    before sending.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500"
                    >
                      Full name
                    </label>
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="contact-email"
                      className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500"
                    >
                      Email
                    </label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="contact-org"
                    className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500"
                  >
                    Church / organization{' '}
                    <span className="font-normal normal-case text-slate-400">(optional)</span>
                  </label>
                  <input
                    id="contact-org"
                    name="organization"
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="e.g. Central Seventh-day Adventist Church"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label
                    htmlFor="contact-subject"
                    className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500"
                  >
                    Subject
                  </label>
                  <input
                    id="contact-subject"
                    name="subject"
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="What is this about?"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label
                    htmlFor="contact-message"
                    className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500"
                  >
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us how we can help…"
                    className={`${inputClass} min-h-[140px] resize-y`}
                  />
                </div>
                <button
                  type="submit"
                  disabled={sending}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-4 text-base font-bold text-white shadow-lg transition hover:opacity-[0.96] active:scale-[0.99] disabled:opacity-60 sm:w-auto sm:min-w-[200px]"
                  style={{
                    background: `linear-gradient(135deg, ${NAVY} 0%, #2563a8 50%, ${TEAL} 140%)`,
                    boxShadow: '0 10px 30px -8px rgba(28, 61, 114, 0.45)',
                  }}
                >
                  <Send className="h-5 w-5" aria-hidden />
                  {sending ? 'Opening…' : 'Send message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
