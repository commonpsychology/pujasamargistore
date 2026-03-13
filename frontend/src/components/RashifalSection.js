'use client';
// src/components/RashifalSection.js

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { useLang } from '../context/LangContext';

// ── Supabase client (reads from env vars) ──────────────────
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const EF = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';

function useInView(threshold = 0.1) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

const PERIODS = [
  { key: 'daily',   label: { en: 'Daily',   ne: 'दैनिक'    } },
  { key: 'weekly',  label: { en: 'Weekly',  ne: 'साप्ताहिक' } },
  { key: 'monthly', label: { en: 'Monthly', ne: 'मासिक'    } },
  { key: 'yearly',  label: { en: 'Yearly',  ne: 'वार्षिक'  } },
];

// Map DB row → component shape
function mapRow(row) {
  return {
    index:      row.rashi_index,
    symbol:     row.symbol,
    emoji:      row.emoji,
    color:      row.color,
    sign:       row.sign_en,
    name:       { en: row.rashi_en,   ne: row.rashi_ne   },
    lord:       { en: row.lord_en,    ne: row.lord_ne    },
    element:    { en: row.element_en, ne: row.element_ne },
    luckyColor: { en: row.lucky_color_en, ne: row.lucky_color_ne },
    luckyNumber: row.lucky_number,
    luckyDay:   { en: row.lucky_day_en, ne: row.lucky_day_ne },
    horoscope: {
      daily:   { en: row.daily_en,   ne: row.daily_ne   },
      weekly:  { en: row.weekly_en,  ne: row.weekly_ne  },
      monthly: { en: row.monthly_en, ne: row.monthly_ne },
      yearly:  { en: row.yearly_en,  ne: row.yearly_ne  },
    },
  };
}

export default function RashifalSection() {
  const { t } = useLang();
  const [ref, visible] = useInView(0.05);
  const detailRef = useRef(null);

  const [rashis, setRashis]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [selected, setSelected] = useState(null);
  const [period, setPeriod]     = useState('daily');
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);

  // ── Fetch all 12 rashis from Supabase ───────────────────
  useEffect(() => {
    async function fetchRashifal() {
      setLoading(true);
      const { data, error } = await supabase
        .from('rashifal')
        .select('*')
        .order('rashi_index', { ascending: true });

      if (error) {
        setError(error.message);
      } else {
        setRashis(data.map(mapRow));
      }
      setLoading(false);
    }
    fetchRashifal();
  }, []);

  const TOTAL     = rashis.length || 12;
  const ANGLE_PER = 360 / TOTAL;

  function selectRashi(rashi) {
    const targetAngle  = -(rashi.index * ANGLE_PER);
    const currentNorm  = ((rotation % 360) + 360) % 360;
    const targetNorm   = ((targetAngle  % 360) + 360) % 360;
    let delta = targetNorm - currentNorm;
    if (delta >  180) delta -= 360;
    if (delta < -180) delta += 360;
    setSpinning(true);
    setRotation(r => r + delta);
    setTimeout(() => {
      setSelected(rashi);
      setSpinning(false);
      setTimeout(() => detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
    }, 500);
  }

  return (
    <section ref={ref} className={`rf-section${visible ? ' rf-in' : ''}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@400;600;800&display=swap');

        .rf-section { background:linear-gradient(180deg,#060b14 0%,#080d18 50%,#060b14 100%); padding:80px 24px; opacity:0; transform:translateY(28px); transition:opacity 0.65s ease,transform 0.65s ease; position:relative; overflow:hidden; }
        .rf-section::before { content:''; position:absolute; inset:0; background:radial-gradient(ellipse at 50% 0%,rgba(250,204,21,0.04) 0%,transparent 60%); pointer-events:none; }
        .rf-section.rf-in { opacity:1; transform:none; }
        .rf-inner { max-width:1200px; margin:0 auto; }
        .rf-eyebrow { font-size:11px; font-weight:800; letter-spacing:3px; text-transform:uppercase; color:#facc15; margin-bottom:10px; font-family:'DM Sans',sans-serif; text-align:center; }
        .rf-heading { font-family:'Cormorant Garamond',serif; font-size:clamp(28px,4vw,44px); font-weight:700; color:#f1f5f9; line-height:1.2; margin-bottom:8px; text-align:center; }
        .rf-gold { color:#facc15; }
        .rf-sub { text-align:center; color:#475569; font-size:14px; margin-bottom:48px; font-family:'DM Sans',sans-serif; }

        /* Layout */
        .rf-layout { display:grid; grid-template-columns:480px 1fr; gap:48px; align-items:start; }
        @media(max-width:900px){ .rf-layout { grid-template-columns:1fr; } }

        /* Wheel */
        .rf-wheel-wrap { position:relative; width:420px; height:420px; margin:0 auto; }
        @media(max-width:520px){ .rf-wheel-wrap { width:300px; height:300px; } }
        .rf-wheel-bg { position:absolute; inset:0; border-radius:50%; background:radial-gradient(circle at center,#0d1b2e 30%,#060b14 100%); border:1px solid rgba(250,204,21,0.12); box-shadow:0 0 60px rgba(250,204,21,0.06),inset 0 0 40px rgba(0,0,0,0.5); }
        .rf-ring { position:absolute; border-radius:50%; border:1px solid rgba(250,204,21,0.06); top:50%; left:50%; transform:translate(-50%,-50%); pointer-events:none; }
        .rf-ring-1 { width:90%; height:90%; }
        .rf-ring-2 { width:70%; height:70%; border-color:rgba(250,204,21,0.04); }
        .rf-ring-3 { width:50%; height:50%; }
        .rf-wheel-svg { position:absolute; inset:0; width:100%; height:100%; transition:transform 0.5s cubic-bezier(0.34,1.56,0.64,1); }
        .rf-center-hub { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); width:72px; height:72px; border-radius:50%; background:radial-gradient(circle,#1a2d4a,#080d18); border:2px solid rgba(250,204,21,0.3); display:flex; align-items:center; justify-content:center; font-size:28px; z-index:10; animation:rfPulse 3s ease-in-out infinite; }
        @keyframes rfPulse { 0%,100%{ box-shadow:0 0 20px rgba(250,204,21,0.1); } 50%{ box-shadow:0 0 35px rgba(250,204,21,0.25); } }
        .rf-pointer { position:absolute; top:-8px; left:50%; transform:translateX(-50%); width:0; height:0; z-index:20; border-left:8px solid transparent; border-right:8px solid transparent; border-top:20px solid #facc15; filter:drop-shadow(0 2px 6px rgba(250,204,21,0.6)); }
        .rf-slice-btn { cursor:pointer; }
        @media(max-width:900px){ .rf-wheel-wrap { display:none; } }

        /* Mobile grid */
        .rf-rashi-grid { display:none; grid-template-columns:repeat(6,1fr); gap:8px; margin-bottom:32px; }
        @media(max-width:900px){ .rf-rashi-grid { display:grid; } }
        @media(max-width:500px){ .rf-rashi-grid { grid-template-columns:repeat(4,1fr); } }
        .rf-grid-btn { display:flex; flex-direction:column; align-items:center; gap:4px; padding:10px 6px; background:linear-gradient(145deg,#0d1b2e,#080f1e); border:1px solid #1a2d4a; border-radius:12px; cursor:pointer; transition:all 0.2s; }
        .rf-grid-btn.active { border-color:rgba(250,204,21,0.5); background:rgba(250,204,21,0.05); }
        .rf-grid-btn:hover { border-color:rgba(250,204,21,0.3); transform:translateY(-2px); }
        .rf-grid-symbol { font-size:18px; line-height:1; }
        .rf-grid-name { font-size:9px; font-weight:700; color:#475569; letter-spacing:0.5px; font-family:'DM Sans',sans-serif; }
        .rf-grid-btn.active .rf-grid-name { color:#facc15; }

        /* Detail panel */
        .rf-detail { background:linear-gradient(135deg,#0d1b2e,#080f1e); border:1px solid #1a2d4a; border-radius:24px; padding:32px; min-height:420px; position:relative; overflow:hidden; transition:border-color 0.3s; }
        .rf-detail-glow { position:absolute; top:-60px; right:-60px; width:200px; height:200px; border-radius:50%; pointer-events:none; transition:background 0.5s; }
        .rf-detail-header { display:flex; align-items:center; gap:16px; margin-bottom:20px; }
        .rf-detail-icon { width:64px; height:64px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:32px; flex-shrink:0; border:2px solid rgba(250,204,21,0.2); background:rgba(250,204,21,0.05); transition:border-color 0.3s,background 0.3s; }
        .rf-detail-name { font-family:'Cormorant Garamond',serif; font-size:28px; font-weight:700; color:#facc15; line-height:1.1; }
        .rf-detail-name-en { font-size:11px; font-weight:800; letter-spacing:2px; text-transform:uppercase; color:#334155; margin-top:2px; font-family:'DM Sans',sans-serif; }
        .rf-detail-pills { display:flex; gap:8px; margin-top:8px; flex-wrap:wrap; }
        .rf-pill { padding:3px 10px; border-radius:20px; font-size:11px; font-weight:700; background:rgba(250,204,21,0.08); color:#94a3b8; border:1px solid rgba(250,204,21,0.1); font-family:'DM Sans',sans-serif; }

        /* Tabs */
        .rf-tabs { display:flex; gap:6px; margin-bottom:24px; background:rgba(0,0,0,0.3); border-radius:14px; padding:5px; flex-wrap:wrap; }
        .rf-tab { flex:1; min-width:60px; padding:8px 12px; border-radius:10px; font-size:12px; font-weight:700; color:#475569; background:transparent; border:none; cursor:pointer; transition:all 0.2s; font-family:'DM Sans',sans-serif; text-align:center; }
        .rf-tab.active { background:linear-gradient(135deg,#854d0e,#facc15); color:#0f172a; box-shadow:0 4px 12px rgba(250,204,21,0.25); }
        .rf-tab:not(.active):hover { color:#94a3b8; }

        /* Prediction */
        .rf-prediction { font-size:14px; color:#94a3b8; line-height:1.9; font-family:'DM Sans',sans-serif; border-left:2px solid rgba(250,204,21,0.2); padding-left:16px; margin-bottom:24px; transition:opacity 0.3s; }

        /* Lucky grid */
        .rf-lucky { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:8px; }
        .rf-lucky-item { background:rgba(255,255,255,0.03); border:1px solid #1a2d4a; border-radius:12px; padding:12px 14px; }
        .rf-lucky-label { font-size:10px; font-weight:800; letter-spacing:1.5px; text-transform:uppercase; color:#334155; margin-bottom:4px; font-family:'DM Sans',sans-serif; }
        .rf-lucky-value { font-family:'Cormorant Garamond',serif; font-size:16px; font-weight:700; color:#facc15; }

        /* CTAs */
        .rf-cta-row { display:flex; gap:10px; margin-top:20px; flex-wrap:wrap; }
        .rf-cta-btn { display:inline-flex; align-items:center; gap:6px; padding:10px 18px; border-radius:10px; font-size:13px; font-weight:700; text-decoration:none; font-family:'DM Sans',sans-serif; transition:all 0.2s; }
        .rf-cta-primary { background:linear-gradient(135deg,#854d0e,#facc15); color:#0f172a; }
        .rf-cta-primary:hover { transform:translateY(-2px); box-shadow:0 8px 20px rgba(250,204,21,0.3); }
        .rf-cta-secondary { border:1px solid rgba(250,204,21,0.25); color:#facc15; background:rgba(250,204,21,0.05); }
        .rf-cta-secondary:hover { background:rgba(250,204,21,0.1); }

        /* States */
        .rf-placeholder { text-align:center; padding:48px 0; color:#475569; font-family:'DM Sans',sans-serif; font-size:14px; }
        .rf-placeholder .big { font-size:48px; display:block; margin-bottom:12px; }
        .rf-skeleton { animation:rfSkel 1.4s ease-in-out infinite; border-radius:8px; }
        @keyframes rfSkel { 0%,100%{ opacity:0.3; } 50%{ opacity:0.6; } }

        /* Updated timestamp */
        .rf-updated { font-size:10px; color:#1e3a5f; text-align:right; margin-top:12px; font-family:'DM Sans',sans-serif; }
      `}</style>

      <div className="rf-inner">
        <div className="rf-eyebrow">{t({ en: '✦ Vedic Astrology ✦', ne: '✦ वैदिक ज्योतिष ✦' })}</div>
        <h2 className="rf-heading">
          {t({ en: 'Daily ', ne: 'आजको ' })}
          <span className="rf-gold">{t({ en: 'Rashifal', ne: 'राशिफल' })}</span>
          {t({ en: ' 2082', ne: ' २०८२' })}
        </h2>
        <p className="rf-sub">
          {t({ en: 'Click your Rashi on the wheel to reveal your Vedic horoscope', ne: 'चक्रमा आफ्नो राशिमा क्लिक गर्नुहोस् र भविष्यफल हेर्नुहोस्' })}
        </p>

        {/* Error state */}
        {error && (
          <p style={{ textAlign: 'center', color: '#ef4444', fontFamily: 'DM Sans', fontSize: 13, marginBottom: 32 }}>
            {t({ en: `Could not load rashifal: ${error}`, ne: `राशिफल लोड गर्न सकिएन: ${error}` })}
          </p>
        )}

        {/* Mobile grid */}
        <div className="rf-rashi-grid">
          {loading
            ? Array(12).fill(0).map((_, i) => (
                <div key={i} className="rf-grid-btn rf-skeleton" style={{ height: 60, background: '#0d1b2e' }} />
              ))
            : rashis.map(r => (
                <button
                  key={r.index}
                  className={`rf-grid-btn${selected?.index === r.index ? ' active' : ''}`}
                  onClick={() => { setSelected(r); setPeriod('daily'); }}
                >
                  <span className="rf-grid-symbol" style={{ color: r.color }}>{r.symbol}</span>
                  <span className="rf-grid-name">{t(r.name)}</span>
                </button>
              ))
          }
        </div>

        <div className="rf-layout">

          {/* ── WHEEL ── */}
          <div>
            <div className="rf-wheel-wrap">
              <div className="rf-wheel-bg" />
              <div className="rf-ring rf-ring-1" />
              <div className="rf-ring rf-ring-2" />
              <div className="rf-ring rf-ring-3" />
              <div className="rf-pointer" />

              {loading ? (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div className="rf-skeleton" style={{ width: 80, height: 20, background: '#1a2d4a', borderRadius: 8 }} />
                </div>
              ) : (
                <svg
                  className="rf-wheel-svg"
                  viewBox="-1 -1 2 2"
                  style={{ transform: `rotate(${rotation}deg)`, transition: spinning ? 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1)' : 'none' }}
                >
                  <defs>
                    <radialGradient id="rfSliceGrad" cx="50%" cy="50%" r="50%">
                      <stop offset="0%"   stopColor="#0d1b2e" />
                      <stop offset="100%" stopColor="#060b14" />
                    </radialGradient>
                  </defs>
                  {rashis.map((rashi) => {
                    const i          = rashi.index;
                    const startAngle = (i * ANGLE_PER - 90)       * (Math.PI / 180);
                    const endAngle   = ((i + 1) * ANGLE_PER - 90) * (Math.PI / 180);
                    const r          = 0.95;
                    const x1 = Math.cos(startAngle) * r;
                    const y1 = Math.sin(startAngle) * r;
                    const x2 = Math.cos(endAngle)   * r;
                    const y2 = Math.sin(endAngle)   * r;
                    const mid = ((i + 0.5) * ANGLE_PER - 90) * (Math.PI / 180);
                    const lx  = Math.cos(mid) * 0.65;
                    const ly  = Math.sin(mid) * 0.65;
                    const sx  = Math.cos(mid) * 0.42;
                    const sy  = Math.sin(mid) * 0.42;
                    const isSel = selected?.index === i;

                    return (
                      <g key={i} className="rf-slice-btn" onClick={() => { selectRashi(rashi); setPeriod('daily'); }}>
                        <path
                          d={`M 0 0 L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`}
                          fill={isSel ? `${rashi.color}22` : 'url(#rfSliceGrad)'}
                          stroke={isSel ? rashi.color : 'rgba(250,204,21,0.12)'}
                          strokeWidth="0.01"
                          style={{ transition: 'fill 0.3s,stroke 0.3s' }}
                        />
                        <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle"
                          fontSize="0.13" fill={isSel ? rashi.color : '#94a3b8'}
                          fontFamily="'Cormorant Garamond',serif" fontWeight="700"
                          style={{ transition: 'fill 0.3s', userSelect: 'none' }}>
                          {rashi.symbol}
                        </text>
                        <text x={sx} y={sy} textAnchor="middle" dominantBaseline="middle"
                          fontSize="0.055" fill={isSel ? '#facc15' : '#475569'}
                          fontFamily="'DM Sans',sans-serif" fontWeight="800"
                          style={{ transition: 'fill 0.3s', userSelect: 'none' }}>
                          {rashi.name.ne}
                        </text>
                      </g>
                    );
                  })}
                  <circle cx="0" cy="0" r="0.22" fill="#060b14" stroke="rgba(250,204,21,0.15)" strokeWidth="0.012" />
                </svg>
              )}

              <div className="rf-center-hub">
                <span style={{ fontFamily: EF }}>🔯</span>
              </div>
            </div>
          </div>

          {/* ── DETAIL PANEL ── */}
          <div ref={detailRef}>
            {loading ? (
              <div className="rf-detail">
                {[100, 60, 80, 90, 70].map((w, i) => (
                  <div key={i} className="rf-skeleton"
                    style={{ height: i === 0 ? 64 : 16, width: `${w}%`, background: '#0d1b2e', marginBottom: 16 }} />
                ))}
              </div>
            ) : !selected ? (
              <div className="rf-detail">
                <div className="rf-placeholder">
                  <span className="big" style={{ fontFamily: EF }}>🔮</span>
                  {t({ en: 'Select your Rashi from the wheel to reveal your Vedic horoscope', ne: 'चक्रबाट आफ्नो राशि छान्नुहोस् र भविष्यफल हेर्नुहोस्' })}
                </div>
              </div>
            ) : (
              <div className="rf-detail" style={{ borderColor: `${selected.color}33` }}>
                <div className="rf-detail-glow"
                  style={{ background: `radial-gradient(circle, ${selected.color}10, transparent 70%)` }} />

                {/* Header */}
                <div className="rf-detail-header">
                  <div className="rf-detail-icon"
                    style={{ borderColor: `${selected.color}44`, background: `${selected.color}10` }}>
                    <span style={{ fontFamily: EF }}>{selected.emoji}</span>
                  </div>
                  <div>
                    <div className="rf-detail-name" style={{ color: selected.color }}>{t(selected.name)}</div>
                    <div className="rf-detail-name-en">{selected.sign} {selected.symbol}</div>
                    <div className="rf-detail-pills">
                      <span className="rf-pill">{t({ en: 'Lord: ', ne: 'स्वामी: ' })}{t(selected.lord)}</span>
                      <span className="rf-pill">{t({ en: 'Element: ', ne: 'तत्व: ' })}{t(selected.element)}</span>
                    </div>
                  </div>
                </div>

                {/* Period tabs */}
                <div className="rf-tabs">
                  {PERIODS.map(p => (
                    <button key={p.key} className={`rf-tab${period === p.key ? ' active' : ''}`}
                      onClick={() => setPeriod(p.key)}>
                      {t(p.label)}
                    </button>
                  ))}
                </div>

                {/* Horoscope text */}
                <p className="rf-prediction">{t(selected.horoscope[period])}</p>

                {/* Lucky info */}
                <div className="rf-lucky">
                  <div className="rf-lucky-item">
                    <div className="rf-lucky-label">{t({ en: 'Lucky Color', ne: 'शुभ रंग' })}</div>
                    <div className="rf-lucky-value" style={{ color: selected.color }}>{t(selected.luckyColor)}</div>
                  </div>
                  <div className="rf-lucky-item">
                    <div className="rf-lucky-label">{t({ en: 'Lucky Number', ne: 'शुभ अंक' })}</div>
                    <div className="rf-lucky-value">{selected.luckyNumber}</div>
                  </div>
                  <div className="rf-lucky-item">
                    <div className="rf-lucky-label">{t({ en: 'Auspicious Day', ne: 'शुभ दिन' })}</div>
                    <div className="rf-lucky-value">{t(selected.luckyDay)}</div>
                  </div>
                  <div className="rf-lucky-item">
                    <div className="rf-lucky-label">{t({ en: 'Ruling Planet', ne: 'स्वामी ग्रह' })}</div>
                    <div className="rf-lucky-value">{t(selected.lord)}</div>
                  </div>
                </div>

                {/* CTAs */}
                <div className="rf-cta-row">
                  <Link href="/cheena" className="rf-cta-btn rf-cta-primary">
                    <span style={{ fontFamily: EF }}>🔮</span>
                    {t({ en: 'Get Birth Chart', ne: 'जन्मकुण्डली बनाउनुहोस्' })}
                  </Link>
                  <Link href="/order" className="rf-cta-btn rf-cta-secondary">
                    <span style={{ fontFamily: EF }}>🪔</span>
                    {t({ en: 'Book Puja', ne: 'पूजा बुक गर्नुहोस्' })}
                  </Link>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}