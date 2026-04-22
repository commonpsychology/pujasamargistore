'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const EMOJI_FONT = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji","Android Emoji",EmojiSymbols,sans-serif';

// ── Festivals with exact AD dates for live countdown ──────────
const FESTIVALS = [
  {
    name:     'होली',
    nepali:   'Holi — रंगको पर्व',
    date:     '2025-03-14',
    emoji:    '🎊',
    color:    '#f97316',
    glow:     'rgba(249,115,22,0.3)',
    items:    ['अबिर / गुलाल', 'पिचकारी', 'विशेष मिठाइ'],
    badge:    'THIS MONTH',
  },
  {
    name:     'राम नवमी',
    nepali:   'Ram Navami — भगवान रामको जन्मोत्सव',
    date:     '2025-04-06',
    emoji:    '🌺',
    color:    '#facc15',
    glow:     'rgba(250,204,21,0.3)',
    items:    ['पूजा थाली', 'फूल माला', 'प्रसाद सामग्री'],
    badge:    'COMING SOON',
  },
  {
    name:     'नयाँ वर्ष २०८२',
    nepali:   'Nepali New Year — नयाँ वर्षको शुरुआत',
    date:     '2025-04-13',
    emoji:    '🪔',
    color:    '#4ade80',
    glow:     'rgba(74,222,128,0.3)',
    items:    ['विशेष पूजा किट', 'दीप सेट', 'नयाँ वर्ष उपहार'],
    badge:    'COMING SOON',
  },
  {
    name:     'बुद्ध जयन्ती',
    nepali:   'Buddha Jayanti — भगवान बुद्धको जन्मोत्सव',
    date:     '2025-05-12',
    emoji:    '☸️',
    color:    '#a78bfa',
    glow:     'rgba(167,139,250,0.3)',
    items:    ['धूप / अगरबत्ती', 'बौद्ध माला', 'पूजा सामग्री'],
    badge:    'UPCOMING',
  },
  {
    name:     'तीज',
    nepali:   'Teej — महिलाहरूको पर्व',
    date:     '2025-08-22',
    emoji:    '🌸',
    color:    '#f43f5e',
    glow:     'rgba(244,63,94,0.3)',
    items:    ['सिन्दूर', 'चुरा सेट', 'तीज पूजा किट'],
    badge:    'UPCOMING',
  },
];

function getDaysRemaining(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const fest  = new Date(dateStr);
  fest.setHours(0, 0, 0, 0);
  return Math.ceil((fest - today) / 86400000);
}

function CountdownBox({ value, label }) {
  return (
    <div style={{
      display:        'flex',
      flexDirection:  'column',
      alignItems:     'center',
      background:     'rgba(0,0,0,0.3)',
      borderRadius:   '8px',
      padding:        '6px 10px',
      minWidth:       '42px',
    }}>
      <span style={{ fontSize: '20px', fontWeight: 900, color: '#f1f5f9', lineHeight: 1 }}>
        {String(value).padStart(2, '0')}
      </span>
      <span style={{ fontSize: '9px', color: '#64748b', fontWeight: 600, marginTop: '2px', letterSpacing: '0.5px' }}>
        {label}
      </span>
    </div>
  );
}

function LiveCountdown({ dateStr, color }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    const calc = () => {
      const diff = new Date(dateStr) - new Date();
      if (diff <= 0) return setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0 });
      setTimeLeft({
        days:  Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        mins:  Math.floor((diff % 3600000)  / 60000),
        secs:  Math.floor((diff % 60000)    / 1000),
      });
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [dateStr]);

  return (
    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
      <CountdownBox value={timeLeft.days}  label="DAYS"  />
      <span style={{ color: '#475569', fontWeight: 900, fontSize: '16px', marginBottom: '10px' }}>:</span>
      <CountdownBox value={timeLeft.hours} label="HRS"   />
      <span style={{ color: '#475569', fontWeight: 900, fontSize: '16px', marginBottom: '10px' }}>:</span>
      <CountdownBox value={timeLeft.mins}  label="MIN"   />
      <span style={{ color: '#475569', fontWeight: 900, fontSize: '16px', marginBottom: '10px' }}>:</span>
      <CountdownBox value={timeLeft.secs}  label="SEC"   />
    </div>
  );
}

export default function FestivalCountdown() {
  const [isMobile, setIsMobile] = useState(false);
  const [active,   setActive]   = useState(0);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Filter out past festivals
  const upcoming = FESTIVALS.filter(f => getDaysRemaining(f.date) >= 0);
  const fest      = upcoming[active] || upcoming[0];

  if (!fest) return null;

  return (
    <>
      <style>{`
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.6; }
          50%       { opacity: 1;   }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px);   }
          50%       { transform: translateY(-6px);  }
        }
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
        .fest-card {
          animation: fadeSlide 0.35s ease;
        }
        .tab-btn {
          transition: all 0.2s ease;
          cursor: pointer;
          border: none;
          font-family: inherit;
        }
        .tab-btn:hover { opacity: 1 !important; }
        .shop-btn {
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .shop-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(250,204,21,0.4) !important;
        }
        .item-pill {
          transition: border-color 0.2s, background 0.2s;
        }
        .item-pill:hover {
          background: rgba(250,204,21,0.08) !important;
          border-color: rgba(250,204,21,0.3) !important;
        }
      `}</style>

      <section style={{
        maxWidth:    '1400px',
        margin:      '0 auto',
        padding:     isMobile ? '32px 14px' : '48px 24px',
        boxSizing:   'border-box',
        width:       '100%',
        overflowX:   'hidden',
      }}>

        {/* ── Section header ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px' }}>
          <div style={{
            width: '4px', height: '28px', borderRadius: '2px',
            background: 'linear-gradient(to bottom, #facc15, #92400e)', flexShrink: 0,
          }} />
          <div>
            <h2 style={{ fontSize: isMobile ? '18px' : '22px', fontWeight: 900, color: '#f8fafc', margin: '0 0 2px' }}>
              🎉 आउँदा पर्वहरू
            </h2>
            <p style={{ color: '#64748b', fontSize: '12px', margin: 0 }}>
              Upcoming festivals — order your pooja items in advance
            </p>
          </div>
        </div>

        {/* ── Tab selector ── */}
        <div style={{
          display:    'flex',
          gap:        '8px',
          marginBottom: '20px',
          flexWrap:   'wrap',
        }}>
          {upcoming.map((f, i) => (
            <button
              key={i}
              className="tab-btn"
              onClick={() => setActive(i)}
              style={{
                padding:      '7px 14px',
                borderRadius: '999px',
                fontSize:     '12px',
                fontWeight:   700,
                background:   active === i ? f.color : 'rgba(30,41,59,0.8)',
                color:        active === i ? '#0f172a' : '#64748b',
                border:       active === i ? 'none' : '1px solid #334155',
                opacity:      active === i ? 1 : 0.7,
                display:      'flex',
                alignItems:   'center',
                gap:          '5px',
              }}
            >
              <span style={{ fontFamily: EMOJI_FONT }}>{f.emoji}</span>
              {f.name}
            </button>
          ))}
        </div>

        {/* ── Main festival card ── */}
        <div
          key={active}
          className="fest-card"
          style={{
            background:   'linear-gradient(145deg, #1e293b, #0f172a)',
            border:       `1px solid ${fest.color}33`,
            borderRadius: '20px',
            overflow:     'hidden',
            position:     'relative',
          }}
        >
          {/* Glow blob */}
          <div style={{
            position:     'absolute',
            top:          '-60px',
            right:        '-60px',
            width:        '240px',
            height:       '240px',
            borderRadius: '50%',
            background:   fest.glow,
            filter:       'blur(60px)',
            animation:    'pulse-glow 3s ease-in-out infinite',
            pointerEvents: 'none',
          }} />

          <div style={{
            display:              'grid',
            gridTemplateColumns:  isMobile ? '1fr' : '1fr 1fr',
            gap:                  '0',
          }}>

            {/* Left — festival info */}
            <div style={{ padding: isMobile ? '24px' : '36px', position: 'relative' }}>

              {/* Badge */}
              <span style={{
                display:      'inline-block',
                background:   `${fest.color}22`,
                border:       `1px solid ${fest.color}55`,
                color:        fest.color,
                fontSize:     '9px',
                fontWeight:   800,
                padding:      '3px 10px',
                borderRadius: '999px',
                letterSpacing: '1px',
                marginBottom: '16px',
              }}>
                {fest.badge}
              </span>

              {/* Emoji */}
              <div style={{
                fontSize:   isMobile ? '52px' : '64px',
                fontFamily: EMOJI_FONT,
                lineHeight: 1,
                marginBottom: '12px',
                animation:  'float 3s ease-in-out infinite',
                display:    'inline-block',
              }}>
                {fest.emoji}
              </div>

              <h3 style={{
                fontSize:   isMobile ? '24px' : '30px',
                fontWeight: 900,
                color:      '#f1f5f9',
                margin:     '0 0 4px',
                lineHeight: 1.2,
              }}>
                {fest.name}
              </h3>
              <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 24px' }}>
                {fest.nepali}
              </p>

              {/* Live countdown */}
              <div style={{ marginBottom: '24px' }}>
                <p style={{ color: '#475569', fontSize: '10px', fontWeight: 700, letterSpacing: '1px', margin: '0 0 8px', textTransform: 'uppercase' }}>
                  Time remaining
                </p>
                <LiveCountdown dateStr={fest.date} color={fest.color} />
              </div>

              {/* Shop button */}
              <Link
                href="/shop"
                className="shop-btn"
                style={{
                  display:        'inline-flex',
                  alignItems:     'center',
                  gap:            '8px',
                  background:     `linear-gradient(135deg, ${fest.color}, #facc15)`,
                  color:          '#0f172a',
                  fontWeight:     800,
                  fontSize:       '13px',
                  padding:        '12px 22px',
                  borderRadius:   '12px',
                  textDecoration: 'none',
                  boxShadow:      `0 4px 16px ${fest.glow}`,
                }}
              >
                <span style={{ fontFamily: EMOJI_FONT }}>🛍️</span>
                पर्वको लागि किनमेल गर्नुहोस्
              </Link>
            </div>

            {/* Right — what to buy */}
            <div style={{
              padding:      isMobile ? '0 24px 24px' : '36px',
              borderLeft:   isMobile ? 'none' : `1px solid ${fest.color}22`,
              borderTop:    isMobile ? `1px solid ${fest.color}22` : 'none',
              display:      'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}>
              <p style={{
                color:         '#475569',
                fontSize:      '10px',
                fontWeight:    700,
                letterSpacing: '1px',
                margin:        '0 0 16px',
                textTransform: 'uppercase',
              }}>
                🛒 यो पर्वको लागि चाहिने सामानहरू
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                {fest.items.map((item, i) => (
                  <div
                    key={i}
                    className="item-pill"
                    style={{
                      display:      'flex',
                      alignItems:   'center',
                      gap:          '10px',
                      padding:      '12px 16px',
                      background:   'rgba(255,255,255,0.03)',
                      border:       '1px solid #334155',
                      borderRadius: '10px',
                    }}
                  >
                    <div style={{
                      width:        '6px',
                      height:       '6px',
                      borderRadius: '50%',
                      background:   fest.color,
                      flexShrink:   0,
                      boxShadow:    `0 0 6px ${fest.color}`,
                    }} />
                    <span style={{ color: '#cbd5e1', fontSize: '13px', fontWeight: 600 }}>{item}</span>
                    <span style={{ marginLeft: 'auto', color: '#334155', fontSize: '12px' }}>→</span>
                  </div>
                ))}
              </div>

              {/* Delivery note */}
              <div style={{
                background:   'rgba(250,204,21,0.06)',
                border:       '1px solid rgba(250,204,21,0.15)',
                borderRadius: '10px',
                padding:      '12px 16px',
                display:      'flex',
                gap:          '10px',
                alignItems:   'flex-start',
              }}>
                <span style={{ fontFamily: EMOJI_FONT, fontSize: '18px', flexShrink: 0 }}>🚚</span>
                <div>
                  <p style={{ color: '#fef9c3', fontWeight: 700, fontSize: '12px', margin: '0 0 2px' }}>
                    पर्व अघि नै अर्डर गर्नुहोस्!
                  </p>
                  <p style={{ color: '#78716c', fontSize: '11px', margin: 0 }}>
                    Same-day delivery before 2 PM — never miss a festival.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </section>
    </>
  );
}