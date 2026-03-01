'use client';

// src/components/Footer.js

import { useState } from 'react';
import Link from 'next/link';

function FooterLink({ href, children }) {
  const cls = 'block text-slate-300 text-sm hover:text-yellow-400 transition-colors duration-200 cursor-pointer';
  if (!href) return <span className={cls}>{children}</span>;
  return <Link href={href} className={cls}>{children}</Link>;
}

/* ── Real SVG social icons ── */
function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  );
}
function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
    </svg>
  );
}
function YoutubeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58a2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.96-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
      <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white"/>
    </svg>
  );
}

const SOCIALS = [
  { label: 'Facebook',  icon: <FacebookIcon />,  href: 'https://facebook.com',  color: 'hover:text-blue-400  hover:border-blue-400' },
  { label: 'Instagram', icon: <InstagramIcon />, href: 'https://instagram.com', color: 'hover:text-pink-400  hover:border-pink-400' },
  { label: 'YouTube',   icon: <YoutubeIcon />,   href: 'https://youtube.com',   color: 'hover:text-red-500   hover:border-red-500' },
];

export default function Footer() {
  return (
    <footer
      className="relative mt-32 bg-slate-950"
      style={{ color: '#cbd5e1' }}
    >
      {/* TOP GRADIENT LINE */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600" />

      <div className="max-w-7xl mx-auto px-8 py-20 grid md:grid-cols-4 gap-14">

        {/* ── BRAND ── */}
        <div>
          <h2 className="text-3xl font-extrabold text-yellow-400">पूजा सामग्री</h2>
          <div className="mt-4 space-y-2 leading-relaxed">
            <p className="font-semibold text-sm text-slate-200">पण्डित पुष्कर राज न्यौपाने</p>
            <p className="text-sm text-slate-300">📞 ९८४९३५००८८</p>
            <p className="text-sm text-slate-300">📍 ठिमी, भक्तपुर</p>
          </div>

          {/* Social icons with real SVGs */}
          <div className="mt-6 flex gap-3">
            {SOCIALS.map(s => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className={`w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 transition-all duration-200 ${s.color}`}
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* ── EXPLORE ── */}
        <div>
          <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-widest">Explore</h4>
          <div className="space-y-3">
            <FooterLink href="/shop">Shop Products</FooterLink>
            <FooterLink href="/shop?cat=festival">Festive Collections</FooterLink>
            <FooterLink href="/contact">Bulk Orders</FooterLink>
            <FooterLink href="/shop?cat=spiritual">Special Pooja Items</FooterLink>
          </div>
        </div>

        {/* ── LEGAL ── */}
        <div>
          <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-widest">Legal</h4>
          <div className="space-y-3">
            <FooterLink href="/policies/privacy">Privacy Policy</FooterLink>
            <FooterLink href="/policies/refund">Refund Policy</FooterLink>
            <FooterLink href="/policies/terms">Terms &amp; Conditions</FooterLink>
            <FooterLink href="/policies/shipping">Shipping Policy</FooterLink>
          </div>
        </div>

        {/* ── NEWSLETTER ── */}
        <div>
          <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-widest">Stay Connected</h4>
          <p className="text-sm text-slate-300 mb-4 leading-relaxed">
            Get updates on festivals, pooja items, and special offerings.
          </p>
          <NewsletterForm />
        </div>

      </div>

      <div className="border-t border-slate-800 mx-8" />
      <p className="text-center text-xs text-slate-500 py-6">
        © 2026 पूजा सामग्री &bull; श्रद्धा र विश्वासका साथ
      </p>
    </footer>
  );
}

function NewsletterForm() {
  const [email,   setEmail]   = useState('');
  const [done,    setDone]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setDone(true);
      setEmail('');
    } catch (err) {
      setError(err.message || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <p className="text-yellow-400 font-semibold text-sm py-3">
        ✓ Subscribed! Thank you 🙏
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email address"
        required
        disabled={loading}
        className="w-full rounded-xl bg-slate-900 border border-slate-700 px-4 py-3 outline-none focus:border-yellow-400 placeholder-slate-500 text-sm disabled:opacity-50"
        style={{ color: '#e2e8f0', boxShadow: 'none' }}
      />
      {error && <p className="text-red-400 text-xs">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 py-3 font-semibold text-slate-900 hover:opacity-90 transition text-sm disabled:opacity-60"
      >
        {loading ? 'Subscribing…' : 'Subscribe'}
      </button>
    </form>
  );
}