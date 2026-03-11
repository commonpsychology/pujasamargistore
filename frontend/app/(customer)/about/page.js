'use client';
// app/(customer)/about/page.js

import Image from 'next/image';
import Link from 'next/link';
import MapHolder from '@/components/MapHolder';
import Footer from '@/components/Footer';

const STATS = [
  { value: '5000+', label: 'Happy Devotees',   emoji: '🙏' },
  { value: '500+',  label: 'Products',          emoji: '🪔' },
  { value: '3 hrs', label: 'Same-Day Delivery', emoji: '🚚' },
  { value: '5★',    label: 'Average Rating',    emoji: '⭐' },
];

const VALUES = [
  {
    emoji: '🏺',
    title: 'Authentic Sourcing',
    titleNe: 'प्रामाणिक स्रोत',
    desc: 'Every item is handpicked from trusted craftsmen and suppliers across Nepal.',
    descNe: 'हरेक सामग्री नेपालका विश्वसनीय कारीगरहरूबाट छानिएको हो।',
  },
  {
    emoji: '⚡',
    title: 'Same-Day Delivery',
    titleNe: 'उही दिन डेलिभरी',
    desc: 'Order before 2 PM and receive your pooja essentials before your evening ritual.',
    descNe: 'दिउँसो २ बजे भन्दा पहिले अर्डर गर्नुहोस् र साँझको पूजा अगावै पाउनुहोस्।',
  },
  {
    emoji: '💎',
    title: 'Premium Quality',
    titleNe: 'उच्च गुणस्तर',
    desc: 'Brass, copper, clay — only the finest materials for your sacred rituals.',
    descNe: 'पित्तल, तामा, माटो — तपाईंको पूजाका लागि सर्वोत्तम सामग्री।',
  },
  {
    emoji: '🤝',
    title: 'Community Rooted',
    titleNe: 'समुदायमा आधारित',
    desc: 'Born in the Kathmandu Valley, serving devotees across Bhaktapur, Patan & beyond.',
    descNe: 'काठमाडौं उपत्यकामा जन्मिएको, भक्तपुर, पाटन र त्यसभन्दा पर सेवा गर्दै।',
  },
];

export default function About() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@400;600;800&display=swap');

        :root {
          --gold: #facc15;
          --gold-dim: rgba(250,204,21,0.12);
          --gold-border: rgba(250,204,21,0.18);
          --orange: #f97316;
          --bg: #080d18;
          --surface: #0f172a;
          --surface2: #111827;
          --text: #f1f5f9;
          --muted: #64748b;
          --dim: #1e293b;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes float {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-8px); }
        }
        @keyframes rotateSlow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        .about-page * { box-sizing: border-box; }

        .about-page {
          font-family: 'DM Sans', sans-serif;
          background: var(--bg);
          color: var(--text);
          min-height: 100vh;
          overflow-x: hidden;
        }

        /* ── HERO ── */
        .hero {
          position: relative;
          min-height: 88vh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding: 80px 24px 60px;
        }

        .hero-ring {
          position: absolute;
          width: 700px; height: 700px;
          border-radius: 50%;
          border: 1px solid rgba(250,204,21,0.06);
          top: 50%; left: 50%;
          transform: translate(-50%,-50%);
          animation: rotateSlow 60s linear infinite;
          pointer-events: none;
        }
        .hero-ring::before {
          content: '';
          position: absolute;
          inset: 40px;
          border-radius: 50%;
          border: 1px dashed rgba(250,204,21,0.08);
        }
        .hero-ring::after {
          content: '';
          position: absolute;
          inset: 100px;
          border-radius: 50%;
          border: 1px solid rgba(250,204,21,0.05);
        }

        .hero-glow {
          position: absolute;
          width: 500px; height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(250,204,21,0.07) 0%, transparent 70%);
          top: 50%; left: 50%;
          transform: translate(-50%,-50%);
          pointer-events: none;
        }

        .hero-inner {
          position: relative;
          z-index: 2;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 64px;
          max-width: 1100px;
          width: 100%;
          align-items: center;
        }

        @media (max-width: 768px) {
          .hero-inner { grid-template-columns: 1fr; gap: 40px; }
          .hero-img-wrap { order: -1; }
        }

        .hero-text { animation: fadeUp 0.7s ease both; }

        .eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: var(--gold-dim);
          border: 1px solid var(--gold-border);
          border-radius: 999px;
          padding: 6px 16px;
          font-size: 11px;
          font-weight: 800;
          color: var(--gold);
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: 20px;
        }

        .hero-heading {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(42px, 6vw, 72px);
          font-weight: 700;
          line-height: 1.05;
          margin: 0 0 24px;
          color: var(--text);
        }

        .hero-heading em {
          font-style: italic;
          background: linear-gradient(90deg, var(--gold), var(--orange), var(--gold));
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }

        .hero-para {
          font-size: 15px;
          line-height: 1.8;
          color: var(--muted);
          margin: 0 0 12px;
        }

        .hero-para-ne {
          font-size: 14px;
          line-height: 1.9;
          color: #475569;
          margin: 0 0 32px;
          font-style: italic;
        }

        .hero-cta {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: linear-gradient(135deg, #854d0e, #facc15);
          color: #0f172a;
          padding: 14px 28px;
          border-radius: 14px;
          font-weight: 800;
          font-size: 14px;
          text-decoration: none;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .hero-cta:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 32px rgba(250,204,21,0.3);
        }

        .hero-img-wrap {
          position: relative;
          animation: fadeUp 0.7s 0.15s ease both;
        }

        .corner-tl, .corner-br {
          position: absolute;
          width: 28px; height: 28px;
          border-color: var(--gold);
          border-style: solid;
          z-index: 2;
        }
        .corner-tl {
          top: -8px; left: -8px;
          border-width: 2px 0 0 2px;
          border-radius: 4px 0 0 0;
        }
        .corner-br {
          bottom: -8px; right: -8px;
          border-width: 0 2px 2px 0;
          border-radius: 0 0 4px 0;
        }

        .float-badge {
          position: absolute;
          bottom: -16px;
          left: 28px;
          background: var(--surface);
          border: 1px solid var(--gold-border);
          border-radius: 14px;
          padding: 12px 20px;
          display: flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.5);
          z-index: 3;
          animation: float 4s ease infinite;
        }

        /* ── STATS ── */
        .stats-section {
          padding: 64px 24px;
          max-width: 1100px;
          margin: 0 auto;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        @media (max-width: 640px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
        }

        .stat-card {
          background: var(--surface2);
          border: 1px solid var(--dim);
          border-radius: 18px;
          padding: 28px 20px;
          text-align: center;
          animation: fadeUp 0.5s ease both;
          transition: border-color 0.2s, transform 0.2s;
        }
        .stat-card:hover {
          border-color: var(--gold-border);
          transform: translateY(-4px);
        }

        .stat-emoji { font-size: 32px; margin-bottom: 10px; }
        .stat-value {
          font-family: 'Cormorant Garamond', serif;
          font-size: 36px;
          font-weight: 700;
          color: var(--gold);
          line-height: 1;
          margin-bottom: 6px;
        }
        .stat-label {
          font-size: 12px;
          color: var(--muted);
          font-weight: 600;
          letter-spacing: 0.5px;
        }

        /* ── VALUES ── */
        .values-section {
          padding: 0 24px 80px;
          max-width: 1100px;
          margin: 0 auto;
        }

        .section-label {
          text-align: center;
          margin-bottom: 48px;
        }

        .section-eyebrow {
          display: inline-block;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 3px;
          color: var(--gold);
          text-transform: uppercase;
          margin-bottom: 12px;
        }

        .section-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(28px, 4vw, 44px);
          font-weight: 700;
          color: var(--text);
          margin: 0;
          line-height: 1.15;
        }

        .values-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        @media (max-width: 640px) {
          .values-grid { grid-template-columns: 1fr; }
        }

        .value-card {
          background: linear-gradient(145deg, var(--surface2), var(--surface));
          border: 1px solid var(--dim);
          border-radius: 20px;
          padding: 28px;
          display: flex;
          gap: 20px;
          animation: fadeUp 0.5s ease both;
          transition: border-color 0.25s, box-shadow 0.25s, transform 0.25s;
        }
        .value-card:hover {
          border-color: var(--gold-border);
          box-shadow: 0 12px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(250,204,21,0.06);
          transform: translateY(-3px);
        }

        .value-icon {
          width: 52px; height: 52px;
          border-radius: 14px;
          background: var(--gold-dim);
          border: 1px solid var(--gold-border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          flex-shrink: 0;
        }

        .value-title {
          font-weight: 800;
          font-size: 15px;
          color: var(--text);
          margin: 0 0 2px;
        }
        .value-title-ne {
          font-size: 12px;
          color: var(--gold);
          font-style: italic;
          margin: 0 0 10px;
        }
        .value-desc {
          font-size: 13px;
          color: var(--muted);
          line-height: 1.7;
          margin: 0 0 6px;
        }
        .value-desc-ne {
          font-size: 12px;
          color: #475569;
          line-height: 1.8;
          font-style: italic;
          margin: 0;
        }

        /* ── BANNER ── */
        .banner {
          max-width: 1100px;
          margin: 0 auto 80px;
          padding: 0 24px;
        }

        .banner-inner {
          background: linear-gradient(135deg, #1e1a0e, #27200a);
          border: 1px solid #78350f;
          border-radius: 24px;
          padding: 48px 40px;
          display: flex;
          align-items: center;
          gap: 32px;
          flex-wrap: wrap;
          position: relative;
          overflow: hidden;
        }

        .banner-inner::before {
          content: '🪔';
          position: absolute;
          right: 32px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 120px;
          opacity: 0.06;
          pointer-events: none;
        }

        .banner-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(22px, 3vw, 32px);
          font-weight: 700;
          color: #fef9c3;
          margin: 0 0 8px;
          line-height: 1.2;
        }
        .banner-sub {
          color: #92400e;
          font-size: 14px;
          margin: 0;
          line-height: 1.6;
        }

        .banner-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: linear-gradient(90deg, #facc15, #f97316);
          color: #0f172a;
          font-weight: 900;
          font-size: 14px;
          padding: 14px 28px;
          border-radius: 14px;
          text-decoration: none;
          white-space: nowrap;
          flex-shrink: 0;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .banner-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(250,204,21,0.35);
        }
      `}</style>

      <main className="about-page">

        {/* ── HERO ── */}
        <section className="hero">
          <div className="hero-ring" />
          <div className="hero-glow" />

          <div className="hero-inner">
            {/* Text */}
            <div className="hero-text">
              <div className="eyebrow">
                <span>🪔</span>
                <span>Our Story</span>
              </div>

              <h1 className="hero-heading">
                Devoted to Your<br />
                <em>Sacred Rituals</em>
              </h1>

              <p className="hero-para">
                We are dedicated to providing authentic religious items for your daily rituals
                and special ceremonies. Our goal is to make it easy for everyone to access
                high-quality items from the comfort of their home.
              </p>
              <p className="hero-para-ne">
                हामी तपाईंको पूजा तथा धार्मिक कार्यहरूको लागि गुणस्तरीय सामग्रीहरू उपलब्ध
                गराउन समर्पित छौँ। हाम्रो उद्देश्य तपाईंलाई घरमै बस्दा नै उच्च गुणस्तरीय
                सामग्रीहरू सजिलै उपलब्ध गराउनु हो।
              </p>

              <Link href="/shop" className="hero-cta">
                🛍️ Shop Pooja Items
                <span style={{ fontSize: '18px' }}>→</span>
              </Link>
            </div>

            {/* MapHolder + Floating Badge */}
            <div className="hero-img-wrap">
              <div style={{ position: 'relative' }}>
                <div className="corner-tl" />
                <div className="corner-br" />
                <MapHolder />
                <div className="float-badge">
                  <span style={{ fontSize: '24px' }}>✨</span>
                  <div>
                    <div style={{ color: '#f1f5f9', fontWeight: 800, fontSize: '13px' }}>
                      Same-Day Delivery
                    </div>
                    <div style={{ color: '#64748b', fontSize: '11px' }}>
                      Kathmandu Valley
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── STATS ── */}
        <section className="stats-section">
          <div className="stats-grid">
            {STATS.map((s, i) => (
              <div
                key={s.value}
                className="stat-card"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="stat-emoji">{s.emoji}</div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── VALUES ── */}
        <section className="values-section">
          <div className="section-label">
            <div className="section-eyebrow">Why Choose Us</div>
            <h2 className="section-title">Crafted with Devotion,<br />Delivered with Care</h2>
          </div>

          <div className="values-grid">
            {VALUES.map((v, i) => (
              <div
                key={v.title}
                className="value-card"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="value-icon">{v.emoji}</div>
                <div>
                  <div className="value-title">{v.title}</div>
                  <div className="value-title-ne">{v.titleNe}</div>
                  <p className="value-desc">{v.desc}</p>
                  <p className="value-desc-ne">{v.descNe}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA BANNER ── */}
        <div className="banner">
          <div className="banner-inner">
            <span style={{ fontSize: '40px', flexShrink: 0 }}>🙏</span>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <h3 className="banner-title">
                पर्व आउनु अघि नै तयारी गर्नुहोस्!
              </h3>
              <p className="banner-sub">
                Order your pooja essentials in advance — we deliver same day before 2 PM
                across the Kathmandu Valley.
              </p>
            </div>
            <Link href="/shop" className="banner-btn">
              🛍️ Shop Now
            </Link>
          </div>
        </div>

      </main>

      
    </>
  );
}