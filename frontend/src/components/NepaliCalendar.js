'use client';
import Link from 'next/link';

// src/components/NepaliCalendar.js
export default function NepaliCalendar() {
  return (
    <section style={{
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '48px 24px',
    }}>
      {/* ── Section header ── */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <span style={{ fontSize: '24px' }}>🗓️</span>
          <h2 style={{
            fontSize: '22px',
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
          }}>
            SPECIAL DAYS AHEAD
          </span>
        </div>
        <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>
          नेपाली पात्रो — आजको मिति, तिथि र आउँदा पर्वहरू
        </p>
      </div>

      {/* ── Single full-height calendar ── */}
      <div style={{
        background: '#27272a',
        border: '1px solid #3f3f46',
        borderRadius: '16px',
        overflow: 'hidden',
        padding: '16px',
      }}>
        <iframe
          src="https://www.ashesh.com.np/calendar-widget/calendar.php?tithi=1&header_color=d97706&api=802225q293"
          frameBorder="0"
          scrolling="no"
          style={{
            border: 'none',
            overflow: 'hidden',
            width: '100%',
            height: '700px',
            borderRadius: '8px',
            display: 'block',
          }}
          allowtransparency="true"
          title="Nepali Calendar"
        />
      </div>

      {/* ── Pooja reminder banner ── */}
      <div style={{
        marginTop: '20px',
        background: 'linear-gradient(135deg, #1e1a0e, #27200a)',
        border: '1px solid #78350f',
        borderRadius: '14px',
        padding: '18px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: '28px' }}>🪔</span>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <p style={{ color: '#fef9c3', fontWeight: 700, fontSize: '14px', margin: '0 0 3px' }}>
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
            padding: '10px 20px',
            borderRadius: '10px',
            textDecoration: 'none',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          🛍️ Shop Now
        </Link>
      </div>
    </section>
  );
}