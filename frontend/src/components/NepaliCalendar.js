'use client';
// src/components/NepaliCalendar.js
// FIX ii:  Dynamic calendar height — full on desktop, compact on mobile
// FIX iii: No horizontal overflow
// FIX iv:  Crisp mobile view with responsive layout
// FIX v:   Emoji font stack for all devices

import { useState, useEffect } from 'react';
import Link from 'next/link';

const EMOJI_FONT = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji","Android Emoji",EmojiSymbols,sans-serif';

export default function NepaliCalendar() {
  const [isMobile, setIsMobile] = useState(false);

  // FIX ii: detect screen width and adjust calendar height dynamically
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // FIX ii: responsive iframe height
  const iframeHeight = isMobile ? '520px' : '750px';

  return (
    <section style={{
      maxWidth: '1400px',
      margin: '0 auto',
      // FIX iii: prevent horizontal overflow
      width: '100%',
      overflowX: 'hidden',
      padding: isMobile ? '32px 14px' : '48px 24px',
      boxSizing: 'border-box',
    }}>
      {/* ── Section header ── */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '8px',
          flexWrap: 'wrap',   // FIX iv: wrap on mobile
        }}>
          <span style={{ fontSize: isMobile ? '20px' : '24px', fontFamily: EMOJI_FONT }}>🗓️</span>
          <h2 style={{
            fontSize: isMobile ? '18px' : '22px',
            fontWeight: 900,
            color: '#f8fafc',
            margin: 0,
          }}>
            विशेष दिनहरू &amp; पर्वहरू
          </h2>
          <span style={{
            background: 'linear-gradient(90deg, #facc15, #f97316)',
            color: '#0f172a',
            fontSize: '10px',
            fontWeight: 800,
            padding: '3px 10px',
            borderRadius: '999px',
            letterSpacing: '0.5px',
            whiteSpace: 'nowrap',
          }}>
            SPECIAL DAYS AHEAD
          </span>
        </div>
        <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>
          नेपाली पात्रो — आजको मिति, तिथि र आउँदा पर्वहरू
        </p>
      </div>

<div style={{
  background: '#080d18',
  border: '1px solid #080d18',
  borderRadius: '16px',
  overflow: 'hidden',
  padding: '0',
  width: '100%',
  boxSizing: 'border-box',
  position: 'relative',
}}>
 <iframe
  src="https://www.ashesh.com.np/calendar-widget/calendar.php?tithi=1&header_color=d97706&api=802225q293"
  scrolling={isMobile ? 'auto' : 'no'}
  style={{
    border: 'none',
    outline: 'none',
    width: '100%',
    height: iframeHeight,
    display: 'block',
    maxWidth: '100%',
    filter: 'invert(1) hue-rotate(180deg)',
    background: '#101314',
    colorScheme: 'dark',
    backgroundColor: '#101314',
    opacity: 1,
  }}
  allowtransparency="true"
  title="Nepali Calendar"
/>
</div>

      {/* ── Pooja reminder banner ── */}
      <div style={{
        marginTop: '16px',
        background: 'linear-gradient(135deg, #1e1a0e, #27200a)',
        border: '1px solid #78350f',
        borderRadius: '14px',
        padding: isMobile ? '14px 16px' : '18px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        flexWrap: 'wrap',
        boxSizing: 'border-box',
        width: '100%',
      }}>
        <span style={{ fontSize: isMobile ? '22px' : '28px', fontFamily: EMOJI_FONT, flexShrink: 0 }}>🪔</span>
        <div style={{ flex: 1, minWidth: '160px' }}>
          <p style={{ color: '#fef9c3', fontWeight: 700, fontSize: isMobile ? '13px' : '14px', margin: '0 0 3px' }}>
            पर्व आउनु अघि नै तयारी गर्नुहोस्!
          </p>
          <p style={{ color: '#92400e', fontSize: '12px', margin: 0 }}>
            Order your pooja essentials in advance — we deliver same day before 2 PM.
          </p>
        </div>
        <Link
          href="/shop"
          style={{
            background: 'linear-gradient(90deg, #facc15, #f97316)',
            color: '#0f172a',
            fontWeight: 800,
            fontSize: '12px',
            padding: '10px 18px',
            borderRadius: '10px',
            textDecoration: 'none',
            whiteSpace: 'nowrap',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span style={{ fontFamily: EMOJI_FONT }}>🛍️</span> Shop Now
        </Link>
      </div>
    </section>
  );
}