'use client';
// src/components/Footer.js

import { useState } from 'react';
import Link from 'next/link';
import { useLang } from '../context/LangContext';

function FooterLink({ href, children }) {
  const cls = 'block text-slate-300 text-sm hover:text-yellow-400 transition-colors duration-200 cursor-pointer';
  if (!href) return <span className={cls}>{children}</span>;
  return <Link href={href} className={cls}>{children}</Link>;
}

function FacebookIcon() {
  return <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>;
}
function InstagramIcon() {
  return <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>;
}
function YoutubeIcon() {
  return <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58a2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.96-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white"/></svg>;
}

const SOCIALS = [
  { label: 'Facebook',  icon: <FacebookIcon />,  href: 'https://facebook.com',  color: 'hover:text-blue-400  hover:border-blue-400' },
  { label: 'Instagram', icon: <InstagramIcon />, href: 'https://instagram.com', color: 'hover:text-pink-400  hover:border-pink-400' },
  { label: 'YouTube',   icon: <YoutubeIcon />,   href: 'https://youtube.com',   color: 'hover:text-red-500   hover:border-red-500'  },
];

const EF = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';

export default function Footer() {
  const { t } = useLang();
  return (
    <footer className="relative mt-32 bg-slate-950" style={{ color: '#cbd5e1' }}>
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600" />

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 text-center sm:text-left">

          {/* BRAND */}
          <div className="flex flex-col items-center sm:items-start">
            <h2 className="text-3xl font-extrabold text-yellow-400">
              {t({ en: 'Puja Samagri', ne: 'पूजा सामग्री' })}
            </h2>
            <div className="mt-4 space-y-2 leading-relaxed">
              <p className="font-semibold text-sm text-slate-200">
                {t({ en: 'Pandit Pushkar Raj Neupane', ne: 'पण्डित पुष्कर राज न्यौपाने' })}
              </p>
              <p className="text-sm text-slate-300"><span style={{ fontFamily: EF }}>📞</span> ९८४९३५००८८</p>
              <p className="text-sm text-slate-300">
                <span style={{ fontFamily: EF }}>📍</span> {t({ en: 'Thimi, Bhaktapur', ne: 'ठिमी, भक्तपुर' })}
              </p>
            </div>
            <div className="mt-6 flex gap-3 justify-center sm:justify-start">
              {SOCIALS.map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                  className={`w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 transition-all duration-200 ${s.color}`}>
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* EXPLORE */}
          <div className="flex flex-col items-center sm:items-start">
            <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-widest">
              {t({ en: 'Explore', ne: 'अन्वेषण' })}
            </h4>
            <div className="space-y-3 w-full">
              <FooterLink href="/shop">{t({ en: 'Shop Products', ne: 'उत्पादनहरू किन्नुहोस्' })}</FooterLink>
              <FooterLink href="/shop?cat=festival">{t({ en: 'Festive Collections', ne: 'उत्सव संग्रह' })}</FooterLink>
              <FooterLink href="/contact">{t({ en: 'Bulk Orders', ne: 'थोक अर्डर' })}</FooterLink>
              <FooterLink href="/shop?cat=spiritual">{t({ en: 'Special Pooja Items', ne: 'विशेष पूजा सामग्री' })}</FooterLink>
            </div>
          </div>

          {/* LEGAL */}
          <div className="flex flex-col items-center sm:items-start">
            <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-widest">
              {t({ en: 'Legal', ne: 'कानुनी' })}
            </h4>
            <div className="space-y-3 w-full">
              <FooterLink href="/policies/privacy">{t({ en: 'Privacy Policy', ne: 'गोपनीयता नीति' })}</FooterLink>
              <FooterLink href="/policies/refund">{t({ en: 'Refund Policy', ne: 'फिर्ता नीति' })}</FooterLink>
              <FooterLink href="/policies/terms">{t({ en: 'Terms & Conditions', ne: 'नियम र सर्तहरू' })}</FooterLink>
              <FooterLink href="/policies/shipping">{t({ en: 'Shipping Policy', ne: 'ढुवानी नीति' })}</FooterLink>
            </div>
          </div>

          {/* NEWSLETTER */}
          <div className="flex flex-col items-center sm:items-start">
            <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-widest">
              {t({ en: 'Stay Connected', ne: 'जोडिइरहनुहोस्' })}
            </h4>
            <p className="text-sm text-slate-300 mb-4 leading-relaxed">
              {t({ en: 'Get updates on festivals, pooja items, and special offerings.',
                   ne: 'चाडपर्व, पूजा सामग्री र विशेष प्रस्तावहरूको जानकारी पाउनुहोस्।' })}
            </p>
            <div className="w-full max-w-xs">
              <NewsletterForm />
            </div>
          </div>

        </div>
      </div>

      <div className="border-t border-slate-800 mx-6" />
      <p className="text-center text-xs text-slate-500 py-6">
        {t({ en: '© 2026 Puja Samagri · With devotion and faith',
             ne: '© 2026 पूजा सामग्री · श्रद्धा र विश्वासका साथ' })}
      </p>
    </footer>
  );
}

function NewsletterForm() {
  const { t } = useLang();
  const [email,   setEmail]   = useState('');
  const [done,    setDone]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const EF = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true); setError('');
    try {
      const res  = await fetch('/api/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setDone(true); setEmail('');
    } catch (err) {
      setError(err.message || t({ en: 'Something went wrong. Try again.', ne: 'केही गडबडी भयो। फेरि प्रयास गर्नुहोस्।' }));
    } finally { setLoading(false); }
  };

  if (done) return (
    <p className="text-yellow-400 font-semibold text-sm py-3 text-center sm:text-left">
      <span style={{ fontFamily: EF }}>✅</span>{' '}
      {t({ en: 'Subscribed! Thank you 🙏', ne: 'सदस्यता लिइयो! धन्यवाद 🙏' })}
    </p>
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full">
      <input type="email" value={email} onChange={e => setEmail(e.target.value)}
        placeholder={t({ en: 'Email address', ne: 'इमेल ठेगाना' })}
        required disabled={loading}
        className="w-full rounded-xl bg-slate-900 border border-slate-700 px-4 py-3 outline-none focus:border-yellow-400 placeholder-slate-500 text-sm disabled:opacity-50 text-center sm:text-left"
        style={{ color: '#e2e8f0' }} />
      {error && <p className="text-red-400 text-xs text-center sm:text-left">{error}</p>}
      <button type="submit" disabled={loading}
        className="w-full rounded-xl bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 py-3 font-bold text-slate-900 hover:opacity-90 transition text-sm disabled:opacity-60"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' }}>
        {loading
          ? <><span style={{ fontFamily: EF }}>⏳</span>{t({ en: 'Subscribing…', ne: 'सदस्यता लिँदैछ…' })}</>
          : <><span style={{ fontFamily: EF }}>🤝</span>{t({ en: 'Subscribe', ne: 'सदस्यता लिनुहोस्' })}<span style={{ fontFamily: EF }}>🔔</span></>
        }
      </button>
    </form>
  );
}