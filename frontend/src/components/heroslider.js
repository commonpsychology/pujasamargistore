'use client';

// src/components/HeroSlider.js
// Auto-sliding hero banner with animated delivery scooter + festival slides

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

const SLIDES = [
  {
    id: 'delivery',
    bg: 'from-[#0f172a] via-[#1e293b] to-[#0f172a]',
    badge: '⚡ Express Delivery',
    badgeColor: 'bg-yellow-400 text-slate-900',
    headline: 'Delivering Today,',
    headlineSub: 'Right to Your Door',
    body: 'Order pooja essentials before 2 PM and receive them the same day. Fresh flowers, diyas, agarbatti — all in one click.',
    cta: { label: '🛍️ Order Now', href: '/shop', style: 'bg-yellow-400 hover:bg-yellow-300 text-slate-900' },
    ctaSecondary: { label: 'View all products →', href: '/shop' },
    visual: 'scooter',
    accent: '#facc15',
  },
  {
    id: 'diwali',
    bg: 'from-[#431407] via-[#7c2d12] to-[#431407]',
    badge: '🪔 Festival Season',
    badgeColor: 'bg-orange-400 text-white',
    headline: 'Diwali Kits',
    headlineSub: 'Curated with Devotion',
    body: 'Complete Laxmi Puja sets, premium diyas, rangoli colors & more. Everything you need for an auspicious celebration.',
    cta: { label: '🪔 Shop Diwali Kits', href: '/shop', style: 'bg-orange-400 hover:bg-orange-300 text-white' },
    ctaSecondary: { label: 'Explore festival collection →', href: '/shop' },
    visual: 'diwali',
    accent: '#fb923c',
  },
  {
    id: 'daily',
    bg: 'from-[#052e16] via-[#14532d] to-[#052e16]',
    badge: '🕉️ नित्य पूजा',
    badgeColor: 'bg-green-400 text-slate-900',
    headline: 'Daily Puja',
    headlineSub: 'Start Every Morning Right',
    body: 'Premium agarbatti, kumkum, tulsi mala, and brass diyas. Handpicked by पण्डित पुष्कर राज न्यौपाने for authentic rituals.',
    cta: { label: '🌸 Shop Essentials', href: '/shop', style: 'bg-green-400 hover:bg-green-300 text-slate-900' },
    ctaSecondary: { label: 'See all spiritual items →', href: '/shop' },
    visual: 'puja',
    accent: '#4ade80',
  },
];

/* ── Scooter SVG illustration ── */
function ScooterScene() {
  return (
    <div className="relative w-full h-full flex items-center justify-center select-none">
      {/* Road */}
      <div className="absolute bottom-6 left-0 right-0 h-1 bg-yellow-400/20 rounded-full" />
      <div className="absolute bottom-6 left-0 right-0 h-px bg-yellow-400/10" />

      {/* Animated scooter */}
      <div className="relative animate-scooter-ride">
        {/* Speed lines */}
        <div className="absolute -left-16 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 opacity-60">
          {[24, 16, 20, 12].map((w, i) => (
            <div
              key={i}
              className="h-0.5 bg-yellow-400/50 rounded-full animate-speed-line"
              style={{ width: `${w}px`, animationDelay: `${i * 0.12}s` }}
            />
          ))}
        </div>

        {/* Scooter SVG */}
        <svg viewBox="0 0 220 130" className="w-52 md:w-64 lg:w-72 drop-shadow-2xl" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Body */}
          <ellipse cx="110" cy="85" rx="72" ry="18" fill="#facc15" opacity="0.12" />
          {/* Rear fender */}
          <path d="M50 75 Q55 55 80 52 L95 52 Q85 68 75 78 Z" fill="#f59e0b" />
          {/* Main body */}
          <path d="M75 78 Q90 45 130 42 L160 45 Q175 50 178 68 L170 78 Z" fill="#facc15" />
          {/* Front fender */}
          <path d="M160 72 Q168 56 178 52 L185 55 Q185 70 175 78 Z" fill="#f59e0b" />
          {/* Seat */}
          <rect x="90" y="38" width="55" height="10" rx="5" fill="#1e293b" />
          {/* Handlebar */}
          <path d="M162 46 Q170 38 175 36 L178 40 Q174 44 168 50 Z" fill="#94a3b8" />
          {/* Windscreen */}
          <path d="M150 42 Q158 32 168 30 L172 35 Q162 38 155 46 Z" fill="#bae6fd" opacity="0.7" />
          {/* Box / package on back */}
          <rect x="52" y="46" width="30" height="24" rx="4" fill="#f97316" />
          <rect x="54" y="48" width="26" height="20" rx="3" fill="#ea580c" />
          <text x="67" y="62" textAnchor="middle" fontSize="9" fill="white" fontWeight="bold">📦</text>
          {/* Rear wheel */}
          <circle cx="75" cy="82" r="18" stroke="#475569" strokeWidth="3" fill="#1e293b" />
          <circle cx="75" cy="82" r="12" stroke="#64748b" strokeWidth="2" fill="#0f172a" />
          <circle cx="75" cy="82" r="4" fill="#facc15" />
          {/* Front wheel */}
          <circle cx="172" cy="82" r="18" stroke="#475569" strokeWidth="3" fill="#1e293b" />
          <circle cx="172" cy="82" r="12" stroke="#64748b" strokeWidth="2" fill="#0f172a" />
          <circle cx="172" cy="82" r="4" fill="#facc15" />
          {/* Rider */}
          <circle cx="138" cy="28" r="12" fill="#fed7aa" />
          <path d="M128 40 Q138 36 148 40 L152 68 L124 68 Z" fill="#f97316" />
          {/* Helmet */}
          <path d="M126 26 Q128 14 138 12 Q148 14 150 26 Q148 20 138 19 Q128 20 126 26 Z" fill="#facc15" />
          <path d="M126 27 Q124 30 126 32 L128 30 Z" fill="#fbbf24" />
          {/* Arms */}
          <path d="M148 46 Q160 44 165 44" stroke="#fed7aa" strokeWidth="4" strokeLinecap="round" />
          {/* Exhaust puff */}
          <circle cx="44" cy="80" r="5" fill="white" opacity="0.15" />
          <circle cx="36" cy="76" r="4" fill="white" opacity="0.1" />
          <circle cx="29" cy="73" r="3" fill="white" opacity="0.06" />
        </svg>
      </div>

      {/* Floating delivery badge */}
      <div className="absolute top-4 right-4 bg-yellow-400 text-slate-900 text-xs font-extrabold px-3 py-1.5 rounded-full shadow-lg animate-float-badge">
        Same Day ✓
      </div>
    </div>
  );
}

/* ── Diwali visual ── */
function DiwaliScene() {
  return (
    <div className="relative w-full h-full flex items-center justify-center select-none overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-48 h-48 rounded-full bg-orange-500/20 blur-3xl animate-pulse" />
      </div>

      {/* Diyas arrangement */}
      <div className="relative flex items-end gap-4">
        {[
          { size: 'w-14 h-14', delay: '0s', flameH: 'h-8', top: 'top-[-28px]' },
          { size: 'w-18 h-18', delay: '0.3s', flameH: 'h-10', top: 'top-[-34px]' },
          { size: 'w-20 h-20', delay: '0.15s', flameH: 'h-12', top: 'top-[-40px]' },
          { size: 'w-18 h-18', delay: '0.45s', flameH: 'h-10', top: 'top-[-34px]' },
          { size: 'w-14 h-14', delay: '0.6s', flameH: 'h-8', top: 'top-[-28px]' },
        ].map((d, i) => (
          <div key={i} className="relative flex flex-col items-center">
            {/* Flame */}
            <div
              className={`absolute ${d.top} left-1/2 -translate-x-1/2 w-4 ${d.flameH} animate-flame`}
              style={{ animationDelay: d.delay }}
            >
              <div className="w-full h-full bg-gradient-to-t from-orange-600 via-yellow-400 to-yellow-200 rounded-full opacity-90" />
              <div className="absolute inset-0 w-2 h-3/4 mx-auto bg-gradient-to-t from-white/60 to-transparent rounded-full" />
            </div>
            {/* Diya */}
            <div className={`${d.size} relative`}>
              <svg viewBox="0 0 60 40" className="w-full h-full drop-shadow-lg">
                <ellipse cx="30" cy="32" rx="28" ry="8" fill="#92400e" />
                <path d="M5 30 Q8 15 30 12 Q52 15 55 30 Q52 35 30 36 Q8 35 5 30Z" fill="#b45309" />
                <path d="M10 28 Q12 18 30 15 Q48 18 50 28 Q45 32 30 33 Q15 32 10 28Z" fill="#d97706" />
                <ellipse cx="30" cy="18" rx="8" ry="3" fill="#fbbf24" opacity="0.8" />
              </svg>
            </div>
            {/* Glow pool */}
            <div
              className="absolute -bottom-1 w-full h-3 rounded-full bg-orange-400/30 blur-sm animate-pulse"
              style={{ animationDelay: d.delay }}
            />
          </div>
        ))}
      </div>

      {/* Floating sparkles */}
      {['top-6 left-8', 'top-10 right-12', 'top-3 left-1/2', 'bottom-10 left-10', 'bottom-8 right-8'].map((pos, i) => (
        <div
          key={i}
          className={`absolute ${pos} text-yellow-300 text-sm animate-sparkle`}
          style={{ animationDelay: `${i * 0.4}s` }}
        >✦</div>
      ))}
    </div>
  );
}

/* ── Puja scene ── */
function PujaScene() {
  return (
    <div className="relative w-full h-full flex items-center justify-center select-none overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-48 h-48 rounded-full bg-green-500/15 blur-3xl" />
      </div>

      <div className="relative flex flex-col items-center gap-4">
        {/* Thali */}
        <div className="relative">
          <svg viewBox="0 0 200 200" className="w-48 h-48 drop-shadow-2xl">
            {/* Thali base */}
            <circle cx="100" cy="100" r="90" fill="#78350f" />
            <circle cx="100" cy="100" r="87" fill="#92400e" />
            <circle cx="100" cy="100" r="80" fill="#b45309" />
            {/* Brass shine */}
            <circle cx="100" cy="100" r="78" fill="url(#brassGrad)" />
            <defs>
              <radialGradient id="brassGrad" cx="35%" cy="35%">
                <stop offset="0%" stopColor="#fde68a" />
                <stop offset="50%" stopColor="#d97706" />
                <stop offset="100%" stopColor="#92400e" />
              </radialGradient>
            </defs>
            {/* Rim pattern */}
            {Array.from({ length: 16 }).map((_, i) => (
              <rect
                key={i}
                x="97" y="15" width="6" height="12" rx="3"
                fill="#fbbf24" opacity="0.7"
                transform={`rotate(${i * 22.5} 100 100)`}
              />
            ))}
            {/* Items on thali */}
            {/* Kumkum bowl */}
            <ellipse cx="75" cy="85" rx="14" ry="10" fill="#dc2626" />
            <ellipse cx="75" cy="82" rx="12" ry="7" fill="#ef4444" />
            {/* Rice */}
            <ellipse cx="125" cy="85" rx="14" ry="10" fill="#f1f5f9" />
            {/* Flower */}
            {[0,60,120,180,240,300].map((deg, i) => (
              <ellipse
                key={i}
                cx="100" cy="72" rx="6" ry="10"
                fill="#fbbf24" opacity="0.9"
                transform={`rotate(${deg} 100 100)`}
              />
            ))}
            <circle cx="100" cy="100" r="8" fill="#f97316" />
            {/* Diya on thali */}
            <ellipse cx="100" cy="130" rx="16" ry="6" fill="#92400e" />
            <path d="M86 128 Q90 120 100 118 Q110 120 114 128 Q110 132 100 133 Q90 132 86 128Z" fill="#d97706" />
            {/* Tiny flame */}
            <ellipse cx="100" cy="113" rx="3" ry="5" fill="#fbbf24" className="animate-pulse" />
          </svg>
        </div>
      </div>

      {/* Om symbol floating */}
      <div className="absolute top-4 right-6 text-green-400/60 text-5xl font-bold animate-float-badge" style={{ fontFamily: 'serif' }}>
        ॐ
      </div>
    </div>
  );
}

/* ── Main slider ── */
export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState('next');

  const goTo = useCallback((idx, dir = 'next') => {
    if (isAnimating) return;
    setDirection(dir);
    setIsAnimating(true);
    setTimeout(() => {
      setCurrent(idx);
      setIsAnimating(false);
    }, 400);
  }, [isAnimating]);

  const next = useCallback(() => {
    goTo((current + 1) % SLIDES.length, 'next');
  }, [current, goTo]);

  const prev = useCallback(() => {
    goTo((current - 1 + SLIDES.length) % SLIDES.length, 'prev');
  }, [current, goTo]);

  // Auto-slide every 5s
  useEffect(() => {
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [next]);

  const slide = SLIDES[current];

  return (
    <>
      <style>{`
        @keyframes scooterRide {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-4px) rotate(-1deg); }
          75% { transform: translateY(-2px) rotate(0.5deg); }
        }
        @keyframes speedLine {
          0%, 100% { opacity: 0.6; transform: translateX(0); }
          50% { opacity: 0.2; transform: translateX(-6px); }
        }
        @keyframes floatBadge {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes flame {
          0%, 100% { transform: scaleX(1) scaleY(1) rotate(-2deg); }
          33% { transform: scaleX(0.85) scaleY(1.1) rotate(2deg); }
          66% { transform: scaleX(1.1) scaleY(0.95) rotate(-1deg); }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0.5); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes slideInFromRight {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInFromLeft {
          from { opacity: 0; transform: translateX(-40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-scooter-ride { animation: scooterRide 1.8s ease-in-out infinite; }
        .animate-speed-line   { animation: speedLine 0.8s ease-in-out infinite; }
        .animate-float-badge  { animation: floatBadge 2.5s ease-in-out infinite; }
        .animate-flame        { animation: flame 1.2s ease-in-out infinite; }
        .animate-sparkle      { animation: sparkle 2s ease-in-out infinite; }
        .slide-enter-right    { animation: slideInFromRight 0.45s ease forwards; }
        .slide-enter-left     { animation: slideInFromLeft  0.45s ease forwards; }
        .fade-up              { animation: fadeUp 0.5s ease forwards; }
        .fade-up-1            { animation: fadeUp 0.5s 0.1s ease both; }
        .fade-up-2            { animation: fadeUp 0.5s 0.2s ease both; }
        .fade-up-3            { animation: fadeUp 0.5s 0.35s ease both; }
        .fade-up-4            { animation: fadeUp 0.5s 0.5s ease both; }
      `}</style>

      <section className="relative w-full overflow-hidden" style={{ minHeight: '420px' }}>

        {/* Slide background */}
        <div
          className={`absolute inset-0 bg-gradient-to-r ${slide.bg} transition-all duration-700`}
        />

        {/* Subtle grid texture */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />

        {/* Accent glow bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 h-24 opacity-20"
          style={{ background: `linear-gradient(to top, ${slide.accent}33, transparent)` }}
        />

        {/* Content */}
        <div
          key={current}
          className={`relative z-10 max-w-screen-2xl mx-auto px-6 md:px-12 py-12 md:py-16 flex flex-col md:flex-row items-center gap-8 md:gap-12 ${
            direction === 'next' ? 'slide-enter-right' : 'slide-enter-left'
          }`}
        >
          {/* LEFT: Text content */}
          <div className="flex-1 flex flex-col items-start gap-4 text-white">

            {/* Badge */}
            <span className={`inline-block text-xs font-extrabold px-3 py-1.5 rounded-full shadow-md fade-up ${slide.badgeColor}`}>
              {slide.badge}
            </span>

            {/* Headline */}
            <div className="fade-up-1">
              <h2
                className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-none tracking-tight"
                style={{ color: slide.accent }}
              >
                {slide.headline}
              </h2>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-none tracking-tight text-white mt-1">
                {slide.headlineSub}
              </h2>
            </div>

            {/* Body */}
            <p className="fade-up-2 text-white/70 text-sm md:text-base max-w-md leading-relaxed">
              {slide.body}
            </p>

            {/* CTAs */}
            <div className="fade-up-3 flex items-center gap-4 flex-wrap mt-2">
              <Link
                href={slide.cta.href}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-extrabold text-sm shadow-xl transition-all duration-200 hover:scale-105 hover:-translate-y-0.5 ${slide.cta.style}`}
              >
                {slide.cta.label}
              </Link>
              <Link
                href={slide.ctaSecondary.href}
                className="text-white/60 text-sm font-semibold hover:text-white transition-colors underline underline-offset-4"
              >
                {slide.ctaSecondary.label}
              </Link>
            </div>

            {/* Delivery promise (only on scooter slide) */}
            {slide.id === 'delivery' && (
              <div className="fade-up-4 flex items-center gap-3 mt-1">
                {['Order by 2 PM', 'Same day delivery', 'Free above ₹499'].map((t, i) => (
                  <span key={i} className="flex items-center gap-1 text-xs text-white/50 font-medium">
                    <span style={{ color: slide.accent }}>✓</span> {t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Visual */}
          <div className="flex-shrink-0 w-full md:w-80 lg:w-96 h-52 md:h-64 lg:h-72">
            {slide.id === 'delivery' && <ScooterScene />}
            {slide.id === 'diwali'   && <DiwaliScene />}
            {slide.id === 'daily'    && <PujaScene />}
          </div>
        </div>

        {/* Navigation arrows */}
        <button
          onClick={prev}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 text-white text-sm font-bold transition-all hover:scale-110 flex items-center justify-center backdrop-blur-sm"
          aria-label="Previous slide"
        >
          ‹
        </button>
        <button
          onClick={next}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 text-white text-sm font-bold transition-all hover:scale-110 flex items-center justify-center backdrop-blur-sm"
          aria-label="Next slide"
        >
          ›
        </button>

        {/* Dot indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {SLIDES.map((s, i) => (
            <button
              key={i}
              onClick={() => goTo(i, i > current ? 'next' : 'prev')}
              className={`transition-all duration-300 rounded-full ${
                i === current
                  ? 'w-6 h-2.5'
                  : 'w-2.5 h-2.5 opacity-40 hover:opacity-70'
              }`}
              style={{ background: i === current ? SLIDES[i].accent : 'white' }}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10 z-20">
          <div
            key={current}
            className="h-full rounded-full"
            style={{
              background: slide.accent,
              animation: 'progress 5s linear forwards',
            }}
          />
        </div>
        <style>{`
          @keyframes progress {
            from { width: 0%; }
            to   { width: 100%; }
          }
        `}</style>
      </section>
    </>
  );
}